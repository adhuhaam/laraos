"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './components/ThemeProvider'
import { HRDataProvider } from './components/HRDataContext'
import { WelcomeIntro } from './components/WelcomeIntro'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'
import { AgentLogin } from './components/AgentLogin'
import { AgentPortal } from './components/AgentPortal'
import { Toaster } from './components/ui/sonner'

type Page = 'intro' | 'login' | 'dashboard' | 'agent-login' | 'agent-portal'

interface CurrentAgent {
  id: string
  name: string
  email: string
  company: string
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('intro')
  const [currentAgent, setCurrentAgent] = useState<CurrentAgent | null>(null)

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    in: { opacity: 1, scale: 1, y: 0 },
    out: { opacity: 0, scale: 1.05, y: -20 }
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  }

  const handleIntroComplete = () => {
    setCurrentPage('login')
  }

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard')
  }

  const handleAgentLoginSuccess = (agent: CurrentAgent) => {
    setCurrentAgent(agent)
    setCurrentPage('agent-portal')
  }

  const handleLogout = () => {
    setCurrentPage('intro')
    setCurrentAgent(null)
  }

  const handleGoToAgentLogin = () => {
    setCurrentPage('agent-login')
  }

  const handleBackToMain = () => {
    setCurrentPage('login')
    setCurrentAgent(null)
  }

  return (
    <div className="min-h-screen w-full">
      <AnimatePresence mode="wait" initial={false}>
        {currentPage === 'intro' ? (
          <motion.div
            key="intro"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen w-full"
          >
            <WelcomeIntro onComplete={handleIntroComplete} />
          </motion.div>
        ) : currentPage === 'login' ? (
          <motion.div
            key="login"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen w-full"
          >
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onGoToAgentLogin={handleGoToAgentLogin}
            />
          </motion.div>
        ) : currentPage === 'agent-login' ? (
          <motion.div
            key="agent-login"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen w-full"
          >
            <AgentLogin 
              onLoginSuccess={handleAgentLoginSuccess}
              onBackToMain={handleBackToMain}
            />
          </motion.div>
        ) : currentPage === 'agent-portal' ? (
          <motion.div
            key="agent-portal"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen w-full"
          >
            <AgentPortal 
              agent={currentAgent}
              onLogout={handleLogout}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen w-full"
          >
            <Dashboard onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <HRDataProvider>
        <AppContent />
      </HRDataProvider>
    </ThemeProvider>
  )
}