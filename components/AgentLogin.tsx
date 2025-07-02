"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { Eye, EyeOff, Network, ArrowLeft, Mail, Lock } from 'lucide-react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { toast } from 'sonner@2.0.3'

interface AgentLoginProps {
  onLoginSuccess: (agent: any) => void
  onBackToMain: () => void
}

// Mock agent credentials for demo
const mockAgents = [
  {
    id: '1',
    email: 'ahmed@globaltrek.mv',
    password: 'agent123',
    name: 'Ahmed Hassan',
    company: 'Global Trek Recruitment'
  },
  {
    id: '2', 
    email: 'fatima@oceanrecruits.com',
    password: 'agent123',
    name: 'Fatima Al-Rashid',
    company: 'Ocean Recruitment Services'
  }
]

export function AgentLogin({ onLoginSuccess, onBackToMain }: AgentLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check credentials
    const agent = mockAgents.find(a => 
      a.email === formData.email && a.password === formData.password
    )

    if (agent) {
      toast.success(`Welcome back, ${agent.name}!`)
      onLoginSuccess(agent)
    } else {
      setError('Invalid email or password. Please try again.')
    }

    setIsLoading(false)
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Button
          variant="ghost"
          onClick={onBackToMain}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to HRoS
        </Button>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg border-border/50">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Network className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Agent Portal</CardTitle>
                <CardDescription>
                  Sign in to access your recruitment dashboard
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !formData.email || !formData.password}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Demo Credentials</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">Test Agent 1:</div>
                  <div className="text-muted-foreground">ahmed@globaltrek.mv / agent123</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">Test Agent 2:</div>
                  <div className="text-muted-foreground">fatima@oceanrecruits.com / agent123</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact HR support at{' '}
              <a href="mailto:support@rcc.com.mv" className="text-primary hover:underline">
                support@rcc.com.mv
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Logo className="h-4 w-4" />
          <span>Powered by HRoS - Rasheed Carpentry & Construction</span>
        </div>
      </div>
    </div>
  )
}