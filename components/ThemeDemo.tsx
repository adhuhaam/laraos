"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Sun, Moon, Palette, CheckCircle, AlertTriangle, Info, 
  Zap, Heart, Star, Bell, Settings, User, Mail, Lock,
  Calendar, Upload, Download, Search, Filter, MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export function ThemeDemo() {
  const { theme } = useTheme()
  const [progress, setProgress] = useState(75)
  const [switchValue, setSwitchValue] = useState(false)
  const [checkboxValue, setCheckboxValue] = useState(false)

  const demoCards = [
    {
      title: "Primary Actions",
      description: "Main interactive elements",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Heart className="h-4 w-4" /></Button>
          </div>
        </div>
      )
    },
    {
      title: "Form Elements",
      description: "Input fields and controls",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-input">Text Input</Label>
            <Input id="demo-input" placeholder="Enter text here..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-select">Select Dropdown</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-textarea">Textarea</Label>
            <Textarea id="demo-textarea" placeholder="Enter longer text..." />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={switchValue} 
                onCheckedChange={setSwitchValue}
                id="demo-switch"
              />
              <Label htmlFor="demo-switch">Toggle Switch</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={checkboxValue} 
                onCheckedChange={setCheckboxValue}
                id="demo-checkbox"
              />
              <Label htmlFor="demo-checkbox">Checkbox</Label>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Status & Feedback",
      description: "Badges, alerts, and progress",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          <div className="space-y-2">
            <Label>Progress: {progress}%</Label>
            <Progress value={progress} className="w-full" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                Decrease
              </Button>
              <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                Increase
              </Button>
            </div>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is an informational alert message.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Navigation & Layout",
      description: "Tabs and organizational elements",
      content: (
        <div className="space-y-4">
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="space-y-2">
              <h4 className="text-sm font-medium">First Tab Content</h4>
              <p className="text-sm text-muted-foreground">
                This is the content for the first tab.
              </p>
            </TabsContent>
            <TabsContent value="tab2" className="space-y-2">
              <h4 className="text-sm font-medium">Second Tab Content</h4>
              <p className="text-sm text-muted-foreground">
                This is the content for the second tab.
              </p>
            </TabsContent>
            <TabsContent value="tab3" className="space-y-2">
              <h4 className="text-sm font-medium">Third Tab Content</h4>
              <p className="text-sm text-muted-foreground">
                This is the content for the third tab.
              </p>
            </TabsContent>
          </Tabs>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Section Separator</span>
            <span className="text-sm text-muted-foreground">Above this line</span>
          </div>
        </div>
      )
    }
  ]

  const iconCards = [
    { icon: Sun, label: "Light Mode", color: "text-yellow-500" },
    { icon: Moon, label: "Dark Mode", color: "text-blue-500" },
    { icon: Palette, label: "Themes", color: "text-purple-500" },
    { icon: CheckCircle, label: "Success", color: "text-green-500" },
    { icon: AlertTriangle, label: "Warning", color: "text-orange-500" },
    { icon: Zap, label: "Energy", color: "text-cyan-500" },
    { icon: Heart, label: "Favorite", color: "text-red-500" },
    { icon: Star, label: "Rating", color: "text-amber-500" }
  ]

  return (
    <div className="space-y-6">
      {/* Theme Demo Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theme System Demo</h1>
          <p className="text-muted-foreground">
            Comprehensive demonstration of light and dark mode compatibility
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Badge variant="outline" className="capitalize">
            {theme} Mode
          </Badge>
        </div>
      </div>

      {/* Current Theme Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-blue-500" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
              Current Theme: {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </CardTitle>
            <CardDescription>
              All components automatically adapt to the selected theme using CSS variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {iconCards.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className={`h-6 w-6 mb-2 ${item.color}`} />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Component Demonstrations */}
      <div className="grid gap-6 md:grid-cols-2">
        {demoCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {card.content}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Interactive Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Interactive Examples</CardTitle>
            <CardDescription>
              Test various interactions to see theme consistency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Success toast!")}>
                Success Toast
              </Button>
              <Button onClick={() => toast.error("Error toast!")}>
                Error Toast
              </Button>
              <Button onClick={() => toast("Info toast!")}>
                Info Toast
              </Button>
              <Button onClick={() => toast.warning("Warning toast!")}>
                Warning Toast
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Settings Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-dashed rounded-lg">
                <h4 className="font-semibold mb-2">Upload Area</h4>
                <div className="flex items-center justify-center h-20 bg-muted/30 rounded border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              
              <div className="p-4 border border-dashed rounded-lg">
                <h4 className="font-semibold mb-2">Search Box</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search anything..." className="pl-10" />
                </div>
              </div>
              
              <div className="p-4 border border-dashed rounded-lg">
                <h4 className="font-semibold mb-2">Action Menu</h4>
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" size="sm" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Color Palette Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Theme Color Palette</CardTitle>
            <CardDescription>
              Current theme color variables and their applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Background', var: '--color-background', class: 'bg-background' },
                { name: 'Foreground', var: '--color-foreground', class: 'bg-foreground' },
                { name: 'Primary', var: '--color-primary', class: 'bg-primary' },
                { name: 'Secondary', var: '--color-secondary', class: 'bg-secondary' },
                { name: 'Muted', var: '--color-muted', class: 'bg-muted' },
                { name: 'Accent', var: '--color-accent', class: 'bg-accent' },
                { name: 'Card', var: '--color-card', class: 'bg-card' },
                { name: 'Border', var: '--color-border', class: 'bg-border' },
                { name: 'Destructive', var: '--color-destructive', class: 'bg-destructive' },
                { name: 'Ring', var: '--color-ring', class: 'bg-ring' }
              ].map((color) => (
                <div key={color.name} className="text-center">
                  <div className={`w-full h-12 rounded-md ${color.class} border border-border mb-2`} />
                  <div className="text-xs font-medium">{color.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{color.var}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}