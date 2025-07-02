"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { useTheme } from './ThemeProvider'
import { 
  Eye, EyeOff, Moon, Sun, ArrowLeft, Loader2, 
  Sparkles, Shield, Zap, CheckCircle, AlertCircle,
  Github, Mail, Phone, Fingerprint, RefreshCw, Network
} from 'lucide-react'
import { Logo } from './Logo'
import { PasswordResetDialog } from './PasswordResetDialog'

interface LoginPageProps {
  onBack?: () => void
  onLoginSuccess?: () => void
  onGoToAgentLogin?: () => void
}

type LoginMethod = 'password' | 'biometric' | 'sso'

interface LoginErrors {
  username?: string
  password?: string
  general?: string
}

export function LoginPage({ onBack, onLoginSuccess, onGoToAgentLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password')
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0
    if (pwd.length >= 8) strength += 25
    if (/[A-Z]/.test(pwd)) strength += 25
    if (/[0-9]/.test(pwd)) strength += 25
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25
    return strength
  }

  const strength = calculatePasswordStrength(password)

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock validation - in real app, this would be API call
      if (username === 'admin' && password === 'password') {
        onLoginSuccess?.()
      } else {
        setErrors({ general: 'Invalid username or password' })
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      onLoginSuccess?.()
    } catch (error) {
      setErrors({ general: 'Biometric authentication failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const floatingVariants = {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 180, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            transition={{
              delay: particle.id * 0.1,
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between p-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-4">
          {onBack && (
            <motion.button
              onClick={onBack}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                whileHover={{ x: -4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.div>
              <span>Back</span>
            </motion.button>
          )}
          <Logo width={120} height={40} />
        </div>

        {/* Theme Toggle */}
        <motion.div 
          className="flex items-center space-x-3 bg-card/50 backdrop-blur-xl p-3 rounded-xl border border-border/50"
          whileHover={{ scale: 1.05 }}
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ 
              rotate: theme === 'light' ? 0 : 180,
              scale: theme === 'light' ? 1 : 0.8,
            }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <Sun className="h-4 w-4 text-amber-500" />
          </motion.div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Toggle theme"
          />
          <motion.div
            animate={{ 
              rotate: theme === 'dark' ? 0 : 180,
              scale: theme === 'dark' ? 1 : 0.8,
            }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <Moon className="h-4 w-4 text-blue-500" />
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Main Content - Flexible container with proper spacing */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 min-h-[calc(100vh-140px)]">
        <motion.div
          className="w-full max-w-md space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Login Card */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-xl bg-card/80 border border-border/50 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Logo width={80} height={32} className="mx-auto mb-4" />
                </motion.div>
                
                <div className="space-y-2">
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <CardDescription>
                    Sign in to access your HRoS dashboard
                  </CardDescription>
                </div>

                {/* Login Method Tabs */}
                <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
                  {[
                    { key: 'password', label: 'Password', icon: Shield },
                    { key: 'biometric', label: 'Biometric', icon: Fingerprint },
                    { key: 'sso', label: 'SSO', icon: Zap }
                  ].map((method) => (
                    <motion.button
                      key={method.key}
                      onClick={() => setLoginMethod(method.key as LoginMethod)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm transition-all duration-300 ${
                        loginMethod === method.key
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <method.icon className="w-4 h-4" />
                      <span>{method.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardHeader>

              {/* General Error Display */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    className="mx-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
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

              <CardContent className="space-y-4">
                <div className="min-h-[280px]">
                  <AnimatePresence mode="wait" initial={false}>
                    {loginMethod === 'password' && (
                      <motion.form
                        key={`password-form-${loginMethod}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                      >
                        {/* Username Field */}
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-base">Username</Label>
                          <div className="relative">
                            <Input
                              id="username"
                              type="text"
                              placeholder="Enter your username"
                              value={username}
                              onChange={(e) => {
                                setUsername(e.target.value)
                                if (errors.username) {
                                  setErrors(prev => ({ ...prev, username: undefined }))
                                }
                              }}
                              className={`transition-all duration-300 h-10 ${
                                errors.username 
                                  ? 'border-destructive focus:border-destructive' 
                                  : username ? 'border-green-500 focus:border-green-500' : 'focus:border-primary/50'
                              }`}
                            />
                            {username && !errors.username && (
                              <motion.div
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                          <AnimatePresence>
                            {errors.username && (
                              <motion.p
                                className="text-sm text-destructive flex items-center space-x-1"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.username}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-base">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value)
                                if (errors.password) {
                                  setErrors(prev => ({ ...prev, password: undefined }))
                                }
                              }}
                              className={`pr-10 h-10 transition-all duration-300 ${
                                errors.password 
                                  ? 'border-destructive focus:border-destructive' 
                                  : password ? 'border-green-500 focus:border-green-500' : 'focus:border-primary/50'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>

                          {/* Password Strength Indicator */}
                          {password && (
                            <motion.div
                              className="space-y-2"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Password Strength</span>
                                <span className={`${
                                  strength < 50 ? 'text-red-500' : 
                                  strength < 75 ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                  {strength < 50 ? 'Weak' : strength < 75 ? 'Medium' : 'Strong'}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  className={`h-2 rounded-full ${
                                    strength < 50 ? 'bg-red-500' : 
                                    strength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${strength}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </motion.div>
                          )}

                          <AnimatePresence>
                            {errors.password && (
                              <motion.p
                                className="text-sm text-destructive flex items-center space-x-1"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.password}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Login Button */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            className="w-full h-10 relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg rounded-xl"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Signing in...
                              </div>
                            ) : (
                              <span className="flex items-center justify-center">
                                <Shield className="mr-2 h-5 w-5" />
                                Sign in Securely
                              </span>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}

                    {loginMethod === 'biometric' && (
                      <motion.div
                        key={`biometric-form-${loginMethod}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-center space-y-4 flex flex-col justify-center h-full"
                      >
                        <motion.div
                          className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          animate={{ 
                            boxShadow: [
                              "0 0 20px rgba(59, 130, 246, 0.3)",
                              "0 0 40px rgba(59, 130, 246, 0.6)",
                              "0 0 20px rgba(59, 130, 246, 0.3)"
                            ]
                          }}
                          transition={{ 
                            boxShadow: { duration: 2, repeat: Infinity }
                          }}
                        >
                          <Fingerprint className="w-10 h-10 text-white" />
                        </motion.div>
                        <div className="space-y-2">
                          <h3 className="text-xl">Biometric Authentication</h3>
                          <p className="text-muted-foreground">
                            Place your finger on the sensor or use face recognition
                          </p>
                        </div>
                        <Button
                          onClick={handleBiometricLogin}
                          className="w-full h-10 bg-gradient-to-r from-green-500 to-emerald-600"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            'Authenticate'
                          )}
                        </Button>
                      </motion.div>
                    )}

                    {loginMethod === 'sso' && (
                      <motion.div
                        key={`sso-form-${loginMethod}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-3"
                      >
                        {[
                          { name: 'Google', icon: Mail, color: 'from-red-500 to-orange-500' },
                          { name: 'Microsoft', icon: Mail, color: 'from-blue-500 to-blue-600' },
                          { name: 'GitHub', icon: Github, color: 'from-gray-700 to-gray-900' }
                        ].map((provider) => (
                          <motion.button
                            key={provider.name}
                            className={`w-full h-10 rounded-xl bg-gradient-to-r ${provider.color} text-white flex items-center justify-center space-x-3 shadow-lg`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <provider.icon className="w-5 h-5" />
                            <span>Continue with {provider.name}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Additional Options */}
                <motion.div className="text-center space-y-3" variants={itemVariants}>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      setResetDialogOpen(true)
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reset Username or Password</span>
                  </motion.button>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <span>Need help?</span>
                    <motion.button
                      className="text-primary hover:underline"
                      whileHover={{ scale: 1.05 }}
                    >
                      Contact Support
                    </motion.button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Agent Portal Link Card - Always visible */}
          {onGoToAgentLogin && (
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <motion.button
                    onClick={onGoToAgentLogin}
                    className="w-full group text-center transition-all duration-200 flex items-center justify-center space-x-4 py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors">
                      <Network className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        Recruitment Agent Portal
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Access your agent dashboard and manage candidates
                      </div>
                    </div>
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Password Reset Dialog */}
      <PasswordResetDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        resetType="both"
      />
    </div>
  )
}