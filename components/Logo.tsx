import React from 'react'
import logoImage from 'figma:asset/be488cbeea98bddc168ba5164940d4cd61d1e69a.png'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = '', width = 120, height = 40 }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logoImage}
        alt="HRoS Logo"
        width={width}
        height={height}
        className="object-contain transition-opacity duration-200"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
}