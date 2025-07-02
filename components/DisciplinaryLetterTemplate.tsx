import React from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import companyLogo from 'figma:asset/d83549437e0333f9bcf277429e95d8b2e95a2647.png'

interface DisciplinaryLetterTemplateProps {
  employee: {
    name: string
    empId: string
    designation: string
  }
  letterType: 'warning' | 'written-warning' | 'final-warning' | 'suspension-notice' | 'improvement-notice'
  violation: string
  description: string
  fineAmount?: number
  incidentDate: string
  letterDate: string
  referenceNumber: string
  hrManager: {
    name: string
    phone: string
  }
  previousWarnings?: boolean
}

// Predefined fine structure as per RCC policy
export const RCC_FINE_STRUCTURE = [
  { violation: 'Absent without valid reason after warnings', amount: 200.00 },
  { violation: 'Going early from the site / work place after warnings', amount: 300.00 },
  { violation: 'Drinking alcohol in Accommodation', amount: 750.00 },
  { violation: 'Sign in the sheet and leaving the site after warnings', amount: 200.00 },
  { violation: 'Staying in room and not going consultation after warnings', amount: 200.00 },
  { violation: 'Not following the rules while driving', amount: 300.00 },
  { violation: 'Using mobile phone in site', amount: 250.00 },
  { violation: 'Not following the supervisor instruction', amount: 250.00 },
  { violation: 'Smoking in the site', amount: 300.00 },
  { violation: 'Not using the safety kit properly', amount: 300.00 }, // or 500.00 for severe cases
  { violation: 'Not maintaining proper hygiene', amount: 200.00 },
  { violation: 'Throwing waste in the site', amount: 200.00 },
  { violation: 'Missing machinery tools in site due to careless', amount: 0 }, // Machinery tool cost
  { violation: 'Sleeping in work site after warnings', amount: 200.00 },
  { violation: 'Site accidents due to careless', amount: 500.00 },
  { violation: 'Conflict with coworkers inside the accommodation', amount: 1000.00 },
  { violation: 'Conflict with coworkers outside the accommodation', amount: 1500.00 }
]

export function DisciplinaryLetterTemplate({ 
  employee, 
  letterType, 
  violation, 
  description, 
  fineAmount, 
  incidentDate, 
  letterDate, 
  referenceNumber,
  hrManager,
  previousWarnings = false
}: DisciplinaryLetterTemplateProps) {
  
  const getLetterTypeTitle = (type: string) => {
    switch (type) {
      case 'warning': return 'Verbal Warning'
      case 'written-warning': return 'Written Warning'
      case 'final-warning': return 'Final Written Warning'
      case 'suspension-notice': return 'Suspension Notice'
      case 'improvement-notice': return 'Performance Improvement Notice'
      default: return 'Disciplinary Notice'
    }
  }

  const formatCurrency = (amount: number) => {
    return `MVR ${amount.toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
    return `${day}${suffix} ${month} ${year}`
  }

  return (
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
        color: '#000', // Ensure text is always black on the letter
        backgroundColor: '#ffffff' // Ensure background is always white
      }}
    >
      {/* Professional Letterhead - Same as Offer Letter */}
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
        
        {/* Company Information */}
        <div 
          className="company-info text-center" 
          style={{ 
            fontSize: '11px', 
            lineHeight: '1.4', 
            color: '#333',
            fontFamily: 'Poppins, Arial, sans-serif'
          }}
        >
          <div 
            className="company-name"
            style={{
              fontWeight: '600',
              fontSize: '12px',
              marginBottom: '3px',
              color: '#333'
            }}
          >
            Human Resource Department
          </div>
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
      </div>

      {/* Content Wrapper */}
      <div className="content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Reference and Date */}
        <div 
          className="ref-date"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8mm'
          }}
        >
          <div>
            <strong style={{ fontSize: '12px', color: '#000' }}>{referenceNumber}</strong>
          </div>
          <div>
            <strong style={{ fontSize: '12px', color: '#000' }}>{formatDate(letterDate)}</strong>
          </div>
        </div>

        {/* Letter Type Title */}
        <div 
          className="letter-title"
          style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '600',
            color: '#dc2626',
            textDecoration: 'underline',
            marginBottom: '8mm',
            fontFamily: 'Poppins, Arial, sans-serif'
          }}
        >
          {getLetterTypeTitle(letterType)}
        </div>

        {/* Letter Content */}
        <div 
          className="content"
          style={{
            fontSize: '10px',
            lineHeight: '1.6',
            fontFamily: 'Poppins, Arial, sans-serif',
            textAlign: 'justify',
            flex: 1,
            color: '#000'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            This notice is given to <strong>Mr. {employee.name}</strong> (ID number: <strong>{employee.empId}</strong>) who works as a <strong>{employee.designation}</strong>, it has come to our attention that {description}
          </div>

          <div style={{ marginBottom: '12px' }}>
            We would like to remind you that this behavior is strictly prohibited and goes against the company's policies and code of conduct. Our company does not appreciate such unprofessional conduct from its employees. All the staff are informed and advised to follow company rules.
          </div>

          {letterType === 'final-warning' && (
            <div style={{ marginBottom: '12px' }}>
              Since you have failed to obey company rules and regulations, consider this as your <strong>Final written warning</strong>.
              {fineAmount && (
                <span> and <strong>{formatCurrency(fineAmount)}</strong> will be deducted as a fine.</span>
              )}
            </div>
          )}

          {letterType !== 'final-warning' && fineAmount && (
            <div style={{ marginBottom: '12px' }}>
              As per company policy, <strong>{formatCurrency(fineAmount)}</strong> will be deducted as a fine for this violation.
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            Please be advised that if you fail to follow company rules and regulations, you will be subject to further disciplinary actions.
          </div>

          {/* Bilingual Note */}
          <div 
            className="note-section"
            style={{
              background: '#f3f4f6',
              padding: '10px',
              borderRadius: '5px',
              margin: '12px 0',
              fontSize: '10px'
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '6px' }}>
              <strong>Note:</strong> Please read and understand the statements mentioned above before signing.
            </div>
            <div style={{ fontSize: '9px', color: '#666' }}>
              <strong>कृपया हस्ताक्षर करने से पहले ऊपर उल्लिखित कथनों को पढ़ें और समझें</strong>
            </div>
          </div>

          {/* Acknowledgment Section */}
          <div style={{ margin: '20px 0' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
              Written Warning Received:
            </div>
            <div style={{ borderBottom: '2px solid black', width: '100%', margin: '12px 0' }}></div>
          </div>

          {/* Signatures Section */}
          <div 
            className="signatures"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
              marginTop: '30px'
            }}
          >
            {/* HR Manager Signature */}
            <div className="signature-section">
              <div 
                className="signature-line"
                style={{
                  borderBottom: '1px solid black',
                  paddingBottom: '5px',
                  marginBottom: '10px'
                }}
              >
                {hrManager.name}
              </div>
              <div 
                className="signature-details"
                style={{ fontSize: '9px' }}
              >
                <div style={{ fontWeight: '600' }}>Human Resource Manager</div>
                <div>{hrManager.phone}</div>
              </div>
            </div>

            {/* Employee Signature */}
            <div className="signature-section">
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ width: '50px', fontWeight: '600', fontSize: '9px' }}>Sign:</span>
                  <div style={{ flex: 1, borderBottom: '1px solid black', marginLeft: '10px' }}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ width: '50px', fontWeight: '600', fontSize: '9px' }}>Name:</span>
                  <span style={{ marginLeft: '10px', fontWeight: '600', fontSize: '9px' }}>{employee.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ width: '50px', fontWeight: '600', fontSize: '9px' }}>Staff ID:</span>
                  <span style={{ marginLeft: '10px', fontWeight: '600', fontSize: '9px' }}>{employee.empId}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '50px', fontWeight: '600', fontSize: '9px' }}>Date:</span>
                  <span style={{ marginLeft: '10px', fontWeight: '600', fontSize: '9px' }}>{formatDate(letterDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fine Structure Reference (Page 2) */}
      <div 
        className="fine-structure"
        style={{
          marginTop: '40mm',
          paddingTop: '20mm',
          borderTop: '2px solid #ccc'
        }}
      >
        <div 
          className="fine-title"
          style={{
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '15px',
            color: '#000'
          }}
        >
          RCC CONSTRUCTION - DISCIPLINARY FINE STRUCTURE
        </div>
        <div 
          className="fine-list"
          style={{
            background: '#f9f9f9',
            padding: '15px',
            borderRadius: '5px'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '12px', color: '#1e40af', fontSize: '11px' }}>
            Below are fines:
          </div>
          <div style={{ fontSize: '9px' }}>
            {RCC_FINE_STRUCTURE.map((fine, index) => (
              <div 
                key={index} 
                className="fine-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '3px 0',
                  borderBottom: '1px solid #e5e5e5'
                }}
              >
                <span style={{ flex: 1 }}>• {fine.violation}</span>
                <span style={{ fontWeight: '600', textAlign: 'right', marginLeft: '10px' }}>
                  {fine.amount === 0 ? 'Machinery tool cost' : `${fine.amount.toFixed(2)} MVR`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility function to generate reference numbers
export function generateReferenceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `HR/RCC/${year}-${month}/${sequence}`
}

// Utility function to get suggested fine amount
export function getSuggestedFineAmount(violation: string): number {
  const matchedFine = RCC_FINE_STRUCTURE.find(fine => 
    fine.violation.toLowerCase().includes(violation.toLowerCase()) ||
    violation.toLowerCase().includes(fine.violation.toLowerCase())
  )
  return matchedFine ? matchedFine.amount : 200.00 // Default fine amount
}