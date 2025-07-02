"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Maximize2, Minimize2, X, RotateCcw, Minus } from 'lucide-react'
import { Card } from './ui/card'

export type ModalSize = 'normal' | 'maximized' | 'minimized'

interface BaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  showControls?: boolean
  onSizeChange?: (size: ModalSize) => void
  defaultSize?: ModalSize
  allowMinimize?: boolean
  allowMaximize?: boolean
  icon?: React.ReactNode
}

const sizeConfigs = {
  normal: {
    width: '85vw',
    height: '80vh',
    maxWidth: '85vw',
    maxHeight: '80vh',
    minWidth: '800px',
    position: 'center'
  },
  maximized: {
    width: '95vw',
    height: '90vh',
    maxWidth: '95vw',
    maxHeight: '90vh',
    minWidth: '800px',
    position: 'center'
  },
  minimized: {
    width: '320px',
    height: '60px',
    maxWidth: '320px',
    maxHeight: '60px',
    minWidth: '300px',
    position: 'bottom-right'
  }
}

export function BaseModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = '',
  showControls = true,
  onSizeChange,
  defaultSize = 'normal',
  allowMinimize = true,
  allowMaximize = true,
  icon
}: BaseModalProps) {
  const [currentSize, setCurrentSize] = useState<ModalSize>(defaultSize)
  const [previousSize, setPreviousSize] = useState<ModalSize>('normal')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  const config = sizeConfigs[currentSize]

  const handleSizeChange = useCallback((newSize: ModalSize) => {
    if (newSize !== currentSize) {
      setPreviousSize(currentSize)
      setCurrentSize(newSize)
      onSizeChange?.(newSize)
    }
  }, [currentSize, onSizeChange])

  const handleToggleMaximize = () => {
    handleSizeChange(currentSize === 'maximized' ? 'normal' : 'maximized')
  }

  const handleMinimize = () => {
    handleSizeChange('minimized')
  }

  const handleRestore = () => {
    handleSizeChange(previousSize === 'minimized' ? 'normal' : previousSize)
  }

  // Position calculation for minimized state
  useEffect(() => {
    if (currentSize === 'minimized') {
      const updatePosition = () => {
        const margin = 16
        setPosition({
          x: window.innerWidth - 320 - margin,
          y: window.innerHeight - 60 - margin
        })
      }
      
      updatePosition()
      window.addEventListener('resize', updatePosition)
      return () => window.removeEventListener('resize', updatePosition)
    }
  }, [currentSize])

  // Prevent closing when minimized (clicking outside)
  const handleOpenChange = (isOpen: boolean) => {
    if (currentSize === 'minimized' && !isOpen) {
      // Don't close when minimized, just ignore the close attempt
      return
    }
    onOpenChange(isOpen)
  }

  const getModalClasses = () => {
    let classes = `
      ${config.position === 'center' ? 'flex items-center justify-center' : ''}
      ${currentSize === 'minimized' ? 'pointer-events-auto' : ''}
    `
    
    if (currentSize === 'minimized') {
      classes += ' fixed z-50'
    }
    
    return classes.trim()
  }

  const getContentClasses = () => {
    let classes = `
      ${className}
      transition-all duration-300 ease-in-out
      ${currentSize === 'minimized' ? 'p-0 overflow-hidden' : 'overflow-hidden'}
    `
    
    if (currentSize === 'minimized') {
      classes += ` 
        !w-[${config.width}] !h-[${config.height}] 
        !max-w-[${config.maxWidth}] !max-h-[${config.maxHeight}]
        !min-w-[${config.minWidth}]
        rounded-lg shadow-lg border
      `
    } else {
      classes += `
        w-[${config.width}] h-[${config.height}]
        max-w-[${config.maxWidth}] max-h-[${config.maxHeight}]
        min-w-[${config.minWidth}]
      `
    }
    
    return classes.trim()
  }

  if (currentSize === 'minimized') {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: position.x,
              y: position.y
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 pointer-events-auto"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${position.x}px, ${position.y}px)`
            }}
          >
            <Card className="w-80 h-15 bg-background border shadow-lg">
              <div className="flex items-center justify-between p-3 h-full">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {icon && <div className="flex-shrink-0">{icon}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handleRestore}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={getContentClasses()}
        style={{
          width: config.width,
          height: config.height,
          maxWidth: config.maxWidth,
          maxHeight: config.maxHeight,
          minWidth: config.minWidth
        }}
      >
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold truncate">{title}</DialogTitle>
                {description && (
                  <DialogDescription className="text-sm text-muted-foreground truncate">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
            
            {showControls && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                {allowMinimize && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handleMinimize}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                {allowMaximize && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handleToggleMaximize}
                  >
                    {currentSize === 'maximized' ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing modal state
export function useModalState(initialSize: ModalSize = 'normal') {
  const [size, setSize] = useState<ModalSize>(initialSize)
  const [isOpen, setIsOpen] = useState(false)

  const openModal = (targetSize?: ModalSize) => {
    if (targetSize) setSize(targetSize)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const toggleModal = () => {
    setIsOpen(prev => !prev)
  }

  const changeSize = (newSize: ModalSize) => {
    setSize(newSize)
  }

  return {
    isOpen,
    size,
    openModal,
    closeModal,
    toggleModal,
    changeSize,
    setIsOpen
  }
}

export default BaseModal