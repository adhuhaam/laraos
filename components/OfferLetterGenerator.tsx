import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseModal } from './BaseModal'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Download, Printer, X, ChevronUp, ChevronDown, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import QRCode from 'react-qr-code'
import companyLogo from 'figma:asset/d83549437e0333f9bcf277429e95d8b2e95a2647.png'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  location: string
  position: string
  experience: number
  expectedSalary: number
  offerAmount?: number
  offerDate?: string
  offerExpiry?: string
}

interface OfferLetterGeneratorProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OfferLetterGenerator({ candidate, open, onOpenChange }: OfferLetterGeneratorProps) {
  const letterRef = useRef<HTMLDivElement>(null)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(0.7) // Default zoom for modal view

  if (!candidate) return null

  // Generate unique verification code for the offer letter
  const generateVerificationCode = () => {
    const timestamp = Date.now()
    const candidateHash = btoa(candidate.id + candidate.name).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
    return `OL${timestamp}${candidateHash}`.toUpperCase()
  }

  const verificationCode = generateVerificationCode()
  const verificationURL = `https://rcc.com.mv/verify-offer/${verificationCode}`

  const handlePrint = () => {
    const printContent = letterRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Offer Letter - ${candidate.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              
              @media print {
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                body { 
                  margin: 0; 
                  padding: 0; 
                  font-family: 'Poppins', Arial, sans-serif;
                  width: 210mm;
                  height: 297mm;
                  overflow: hidden;
                  background: white !important;
                  color: black !important;
                }
                
                .no-print { display: none !important; }
                
                .a4-page {
                  width: 210mm;
                  height: 297mm;
                  margin: 0;
                  padding: 20mm;
                  box-sizing: border-box;
                  position: relative;
                  background: white !important;
                  color: black !important;
                  display: flex;
                  flex-direction: column;
                  transform: none !important;
                }
                
                .letterhead {
                  margin-bottom: 4mm;
                  position: relative;
                  padding-bottom: 10mm;
                }
                
                .logo-container {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  text-align: center;
                  margin-bottom: 6mm;
                  width: 100%;
                }
                
                .company-logo {
                  max-height: 30mm;
                  width: auto;
                  margin: 0 auto;
                  display: block;
                }
                
                .company-info {
                  text-align: center;
                  font-size: 11px;
                  line-height: 1.4;
                  color: #333 !important;
                  font-family: 'Poppins', Arial, sans-serif;
                }
                
                .company-name {
                  font-weight: 600;
                  font-size: 12px;
                  margin-bottom: 3px;
                  color: #333 !important;
                }
                
                .separator-line {
                  width: 100%;
                  height: 1px;
                  background: #ddd !important;
                  margin: 2mm 0 3mm 0;
                }
                
                .letterhead-bottom {
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  height: 25mm;
                }
                
                .company-contact-info {
                  text-align: center;
                  font-size: 9px;
                  font-weight: 500;
                  color: #666 !important;
                  font-family: 'Poppins', Arial, sans-serif;
                  line-height: 1.3;
                  padding-top: 2mm;
                }
                
                .qr-verification {
                  position: absolute;
                  bottom: 20mm;
                  right: 4mm;
                  width: 22mm;
                  height: 22mm;
                  background: white !important;
                  border: 1px solid #ddd !important;
                  padding: 1mm;
                  box-sizing: border-box;
                }
                
                .qr-code {
                  width: 100%;
                  height: 100%;
                }
                
                .qr-text {
                  position: absolute;
                  bottom: 16mm;
                  right: 4mm;
                  text-align: center;
                  font-size: 6px;
                  color: #666 !important;
                  font-family: 'Poppins', Arial, sans-serif;
                  line-height: 1;
                  width: 22mm;
                }
                
                .content-wrapper {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  position: relative;
                }
                
                .title { 
                  font-size: 16px; 
                  font-weight: 600; 
                  text-decoration: underline; 
                  margin: 0 0 16px; 
                  text-align: center; 
                  font-family: 'Poppins', Arial, sans-serif;
                  color: black !important; 
                }
                
                .content { 
                  font-size: 10px; 
                  line-height: 1.5; 
                  font-family: 'Poppins', Arial, sans-serif; 
                  text-align: justify; 
                  flex: 1;
                  color: black !important;
                }
                
                .section { margin: 12px 0; }
                .section-title { font-weight: 600; margin: 8px 0 6px; text-decoration: underline; font-size: 10px; color: black !important; }
                .details-row { margin: 4px 0; text-align: justify; font-size: 10px; color: black !important; }
                .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
                .signature-box { width: 45%; }
                .signature-line { border-bottom: 1px solid #000 !important; margin: 20px 0 8px; height: 12px; }
                .signature-header { margin-bottom: 32px; }
                .bold { font-weight: 600; }
                .underline { text-decoration: underline; }
                .justify-text { text-align: justify; }
                .text-10 { font-size: 10px; }
                
                .footer-address {
                  margin-bottom: 3px;
                  font-weight: 600;
                  color: #333 !important;
                }
                
                .footer-contacts {
                  font-size: 8px;
                  color: #777 !important;
                }
                
                /* Ensure all text elements are black for print */
                * {
                  color: black !important;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
    
    toast.success('Offer letter sent to printer')
  }

  const handleDownload = () => {
    handlePrint() // For now, use print functionality for download
    toast.success('Offer letter download initiated')
  }

  const handleFullScreen = () => {
    setIsFullScreen(true)
    setZoomLevel(1) // Full size for full screen
  }

  const handleExitFullScreen = () => {
    setIsFullScreen(false)
    setZoomLevel(0.7) // Back to scaled size for modal
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.3))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB')
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getCommencementDate = () => {
    if (candidate.offerDate) {
      const offerDate = new Date(candidate.offerDate)
      const commencementDate = new Date(offerDate)
      commencementDate.setDate(commencementDate.getDate() + 15) // 15 days from offer
      return commencementDate.toLocaleDateString('en-GB')
    }
    const today = new Date()
    const commencementDate = new Date(today)
    commencementDate.setDate(commencementDate.getDate() + 15) // 15 days from today if no offer date
    return commencementDate.toLocaleDateString('en-GB')
  }

  const generateEmployeeId = () => {
    return `V${Math.floor(Math.random() * 900000) + 100000}`
  }

  const renderOfferLetterContent = () => (
    <div 
      className="bg-white shadow-lg border border-border/20" 
      style={{ 
        width: '210mm', 
        height: '297mm',
        fontFamily: 'Poppins, Arial, sans-serif',
        minWidth: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        transform: `scale(${zoomLevel})`,
        transformOrigin: isFullScreen ? 'center center' : 'center center',
        color: '#000', // Ensure text is always black on the letter
        backgroundColor: '#ffffff' // Ensure background is always white
      }}
    >
      {/* QR Code - Positioned at Bottom Right with 4mm margin */}
      <div 
        className="qr-verification"
        style={{
          position: 'absolute',
          bottom: '20mm',
          right: '4mm',
          width: '18mm',
          height: '18mm',
          background: 'white',
          border: '1px solid #ddd',
          padding: '1mm',
          boxSizing: 'border-box',
          zIndex: 10
        }}
      >
        <QRCode
          value={verificationURL}
          size={256}
          style={{ 
            height: "100%", 
            maxWidth: "100%", 
            width: "100%" 
          }}
          viewBox="0 0 256 256"
          className="qr-code"
        />
      </div>
      
      {/* QR Code Text - Below QR */}
      <div 
        className="qr-text"
        style={{
          position: 'absolute',
          bottom: '16mm',
          right: '4mm',
          textAlign: 'center',
          fontSize: '6px',
          color: '#666',
          fontFamily: 'Poppins, Arial, sans-serif',
          lineHeight: '1',
          width: '22mm'
        }}
      >
        Scan to Verify
      </div>

      {/* Optimized Letterhead */}
      <div className="letterhead" style={{ marginBottom: '4mm', position: 'relative', paddingBottom: '10mm' }}>
        {/* Logo Section */}
        <div 
          className="logo-container" 
          style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '6mm',
            width: '100%'
          }}
        >
          <img 
            src={companyLogo} 
            alt="Rasheed Carpentry & Construction" 
            className="company-logo"
            style={{ 
              maxHeight: '30mm', 
              width: 'auto',
              margin: '0 auto',
              display: 'block'
            }}
          />
        </div>
        
        {/* Company Information - Only Company Name */}
        <div 
          className="company-info text-center" 
          style={{ 
            fontSize: '11px', 
            lineHeight: '1.4', 
            color: '#333',
            fontFamily: 'Poppins, Arial, sans-serif'
          }}
        >
          
        </div>
        
        {/* Separator Line */}
        <div 
          className="separator-line" 
          style={{ 
            width: '100%', 
            height: '1px', 
            background: '#ddd', 
            margin: '2mm 0 3mm 0' 
          }}
        ></div>
        
        {/* Contact Info Only */}
        <div 
          className="letterhead-bottom"
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '25mm'
          }}
        >
          {/* Company Contact Info */}
          <div 
            className="company-contact-info"
            style={{
              textAlign: 'center',
              fontSize: '9px',
              fontWeight: '500',
              color: '#666',
              fontFamily: 'Poppins, Arial, sans-serif',
              lineHeight: '1.3',
              paddingTop: '2mm'
            }}
          >
            
            
          </div>
        </div>
      </div>

      {/* Content Wrapper - Moved up to letterhead level */}
      <div className="content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Title */}
        <div className="title text-center font-semibold underline mb-4" style={{ 
          fontSize: '16px', 
          fontFamily: 'Poppins, Arial, sans-serif',
          color: '#000'
        }}>
          JOB OFFER LETTER
        </div>

        {/* Content */}
        <div className="content leading-relaxed text-justify" style={{ 
          fontSize: '10px', 
          fontFamily: 'Poppins, Arial, sans-serif',
          textAlign: 'justify',
          flex: 1,
          color: '#000'
        }}>
          <div className="mb-3">
            <div className="font-semibold" style={{ fontSize: '10px', color: '#000' }}>
              {candidate.name.toUpperCase()} ({generateEmployeeId()})
            </div>
            <div style={{ fontSize: '10px', color: '#000' }}>{candidate.location}</div>
          </div>

          <div className="mb-3 text-justify" style={{ fontSize: '10px', color: '#000' }}>
            <span className="font-semibold underline">Subject:</span> Offer of Employment for the Position of <span className="font-semibold">{candidate.position}</span>
          </div>

          <div className="mb-3" style={{ fontSize: '10px', color: '#000' }}>
            Dear {candidate.name.split(' ')[0].toUpperCase()},
          </div>

          <div className="mb-3 text-justify" style={{ fontSize: '10px', color: '#000' }}>
            We are pleased to extend an offer of employment to you for the position of <span className="font-semibold">{candidate.position}</span> with Rasheed Carpentry & Construction Pvt Ltd based in the Maldives.
          </div>

          <div className="mb-3 text-justify" style={{ fontSize: '10px', color: '#000' }}>
            The terms and conditions of your employment are outlined below:
          </div>

          {/* Employment Details Section */}
          <div className="section mb-3">
            <div className="section-title font-semibold underline mb-2" style={{ fontSize: '10px', color: '#000' }}>
              Employment Details
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Job Title:</span> {candidate.position}
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Contract & Duration:</span> 2 years Contract (renewable), the employment contract will be signed upon arrival.
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Working Hours:</span> 8 hours/day, 6 day/week, Employee might have to report to duty on odd hours due to the nature of the business.
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Commencement Date:</span> {getCommencementDate()}
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Worksite:</span> RASHEED CARPENTRY AND CONSTRUCTION PVT LTD
            </div>
            <div className="details-row text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Medical Insurance & Accommodation:</span> Medical insurance and accommodation will be provided by the company.
            </div>
          </div>

          {/* Salary & Allowance Details Section */}
          <div className="section mb-3">
            <div className="section-title font-semibold underline mb-2" style={{ fontSize: '10px', color: '#000' }}>
              Salary & Allowance Details
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Basic Salary:</span> MVR {candidate.offerAmount?.toLocaleString() || candidate.expectedSalary.toLocaleString()} per month
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Overtime:</span> As per Maldivian Labor Law
            </div>
            <div className="details-row text-justify" style={{ fontSize: '10px', color: '#000' }}>
              <span className="font-semibold">Annual Leave:</span> 30 days annually as per Maldivian Labor Law
            </div>
          </div>

          {/* Important Notes Section */}
          <div className="section mb-3">
            <div className="section-title font-semibold underline mb-2" style={{ fontSize: '10px', color: '#000' }}>
              Important Notes
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              • This offer is contingent upon successful completion of all pre-employment requirements.
            </div>
            <div className="details-row mb-1 text-justify" style={{ fontSize: '10px', color: '#000' }}>
              • All terms and conditions are subject to Maldivian Labor Laws and Company policies.
            </div>
            <div className="details-row text-justify" style={{ fontSize: '10px', color: '#000' }}>
              • Please confirm your acceptance by {formatDate(candidate.offerExpiry)} to secure this position.
            </div>
          </div>

          <div className="mb-3 text-justify" style={{ fontSize: '10px', color: '#000' }}>
            We look forward to welcoming you to our team and are excited about the contribution you will make to our organization.
          </div>

          <div className="mb-3" style={{ fontSize: '10px', color: '#000' }}>
            Sincerely,
          </div>

          {/* Signature Section */}
          <div className="signature-section mt-8" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
            <div className="signature-box" style={{ width: '45%' }}>
              <div className="signature-line" style={{ borderBottom: '1px solid #000', margin: '20px 0 8px', height: '12px' }}></div>
              <div style={{ fontSize: '9px', color: '#000' }}>
                <div className="font-semibold">HR Manager</div>
                <div>Rasheed Carpentry & Construction Pvt Ltd</div>
                <div>Date: {formatDate()}</div>
              </div>
            </div>
            <div className="signature-box" style={{ width: '45%' }}>
              <div className="signature-line" style={{ borderBottom: '1px solid #000', margin: '20px 0 8px', height: '12px' }}></div>
              <div style={{ fontSize: '9px', color: '#000' }}>
                <div className="font-semibold">Candidate Acceptance</div>
                <div>{candidate.name}</div>
                <div>Date: _______________</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!open) return null

  // Full Screen Mode
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background overflow-hidden">
        {/* Full Screen Controls */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border no-print">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Offer Letter - {candidate.name}</h2>
              <span className="text-sm text-muted-foreground">Full Screen Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.3}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-3 min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 1.5}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleExitFullScreen}>
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Full Screen
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Full Screen Content */}
        <div className="w-full h-full bg-muted/30 overflow-auto pt-20">
          <div ref={letterRef} className="flex items-center justify-center min-h-full p-8">
            {renderOfferLetterContent()}
          </div>
        </div>
      </div>
    )
  }

  // Modal Mode
  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Offer Letter - ${candidate.name}`}
      description={`Generate and print a professional A4 offer letter for ${candidate.name} for the position of ${candidate.position}`}
      icon={<Printer className="h-5 w-5" />}
      allowMinimize={true}
      allowMaximize={true}
      defaultSize="maximized"
      showControls={true}
    >
      <div className="flex flex-col h-full">
        {/* Collapsible Header Controls */}
        <Collapsible 
          open={!isHeaderCollapsed} 
          onOpenChange={(open) => setIsHeaderCollapsed(!open)}
          className="flex-shrink-0 border-b border-border no-print"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-1 h-6 w-6"
                >
                  {isHeaderCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  {isHeaderCollapsed ? 'Show Controls' : 'Hide Controls'}
                </span>
              </div>
              {isHeaderCollapsed && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleFullScreen(); }}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handlePrint(); }}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verification Code: {verificationCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-4">
                    <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.3}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-3 min-w-[60px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 1.5}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleFullScreen}>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Full Screen
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print A4
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Modal Content */}
        <div className="flex-1 bg-muted/30 overflow-auto transition-all duration-300 p-4">
          <div ref={letterRef} className="h-full flex items-center justify-center">
            {renderOfferLetterContent()}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}