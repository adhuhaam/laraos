import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X,
  Copy,
  Eye,
  Scan,
  FileText,
  Edit3,
  Zap,
  ArrowRight,
  HelpCircle,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface ExtractedData {
  passportNumber?: string
  name?: string
  nationality?: string
  dateOfBirth?: string
  expiryDate?: string
  issueDate?: string
  placeOfBirth?: string
  sex?: string
  issuingAuthority?: string
  address?: string
  emergencyContactName?: string
  emergencyContactRelationship?: string
}

interface OCRUploadProps {
  onDataExtracted?: (data: ExtractedData) => void
  acceptedTypes?: string[]
  maxFileSize?: number
  title?: string
  description?: string
}

export function OCRUpload({ 
  onDataExtracted,
  acceptedTypes = ['image/*'],
  maxFileSize = 10,
  title = "Document Data Entry",
  description = "Upload document image and enter text data manually for reliable extraction"
}: OCRUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [manualText, setManualText] = useState<string>('')
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [activeStep, setActiveStep] = useState<'upload' | 'text' | 'extract'>('upload')
  
  // Manual entry form state
  const [manualData, setManualData] = useState<ExtractedData>({})

  // Real-time text analysis
  const analyzeText = useCallback((text: string): ExtractedData => {
    const data: ExtractedData = {}
    const cleanText = text.replace(/\s+/g, ' ').trim()
    const upperText = cleanText.toUpperCase()
    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    // Passport Number - Enhanced patterns
    const passportPatterns = [
      /PASSPORT\s*(?:NO|NUMBER|#)?\s*:?\s*([A-Z0-9]{6,12})/i,
      /(?:^|\s)([A-Z]{1,3}\d{6,9})(?:\s|$)/,
      /(?:^|\s)([A-Z]\d{7,8})(?:\s|$)/,
      /(?:^|\s)(\d{8,9})(?:\s|$)/,
      /([A-Z]{2}\d{6,8})/,
      // Common passport formats by country
      /([A-Z]{2}\d{7})/,  // UK format
      /([A-Z]\d{8})/,     // US format
      /(P\d{7})/,         // Some EU formats
    ]

    for (const pattern of passportPatterns) {
      const match = upperText.match(pattern)
      if (match && match[1]) {
        const candidate = match[1].replace(/[^A-Z0-9]/g, '')
        if (candidate.length >= 6 && candidate.length <= 12) {
          data.passportNumber = candidate
          break
        }
      }
    }

    // Name extraction - Multiple strategies
    const namePatterns = [
      // Label-based
      /(?:NAME|GIVEN|SURNAME)\s*:?\s*([A-Z][A-ZÀ-ÿ\s]{5,40})/i,
      /(?:GIVEN\s+NAMES?)\s*:?\s*([A-Z][A-ZÀ-ÿ\s]{5,40})/i,
      // All caps names (common in passports)
      /^([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)$/m,
      /([A-Z]{3,}\s+[A-Z]{3,}(?:\s+[A-Z]{3,})?)/,
      // Mixed case names
      /([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)/
    ]

    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern)
      if (match && match[1]) {
        const candidate = match[1].trim()
        const words = candidate.split(/\s+/)
        if (words.length >= 2 && words.length <= 4 && 
            words.every(w => w.length >= 2) &&
            candidate.length >= 5 && candidate.length <= 50 &&
            !/\d/.test(candidate)) {
          data.name = candidate
          break
        }
      }
    }

    // Date extraction - Multiple formats
    const datePatterns = [
      // DD/MM/YYYY variants
      /(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4})/g,
      // YYYY-MM-DD variants
      /(\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2})/g,
      // DD MMM YYYY (15 MAR 1985)
      /(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{4})/gi,
      // MMM DD YYYY (MAR 15 1985)
      /((?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{1,2}\s+\d{4})/gi,
      // DD MONTH YYYY
      /(\d{1,2}\s+(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+\d{4})/gi
    ]

    const extractedDates: Array<{value: string, context: string}> = []
    
    datePatterns.forEach(pattern => {
      const matches = [...cleanText.matchAll(pattern)]
      matches.forEach(match => {
        if (match[1] || match[0]) {
          const dateValue = match[1] || match[0]
          const index = match.index || 0
          const context = cleanText.substring(Math.max(0, index - 20), index + 50).toLowerCase()
          extractedDates.push({ value: dateValue, context })
        }
      })
    })

    // Assign dates based on context
    extractedDates.forEach(({value, context}) => {
      if (context.includes('birth') || context.includes('born') || context.includes('dob')) {
        if (!data.dateOfBirth) data.dateOfBirth = value
      } else if (context.includes('expir') || context.includes('valid') || context.includes('expire')) {
        if (!data.expiryDate) data.expiryDate = value
      } else if (context.includes('issue') || context.includes('delivered')) {
        if (!data.issueDate) data.issueDate = value
      }
    })

    // Fallback: assign dates by position if no context matches
    const uniqueDates = [...new Set(extractedDates.map(d => d.value))]
    if (!data.dateOfBirth && uniqueDates[0]) data.dateOfBirth = uniqueDates[0]
    if (!data.issueDate && uniqueDates[1]) data.issueDate = uniqueDates[1]
    if (!data.expiryDate && uniqueDates[2]) data.expiryDate = uniqueDates[2]

    // Nationality extraction
    const nationalityPatterns = [
      /(?:NATIONALITY|CITIZEN)\s*:?\s*([A-Z]{3,20})/i,
      /(AMERICAN|BRITISH|CANADIAN|AUSTRALIAN|GERMAN|FRENCH|SPANISH|ITALIAN|JAPANESE|CHINESE|INDIAN|PAKISTANI|BANGLADESHI|FILIPINO|EGYPTIAN|SAUDI|EMIRATI)/i,
      /(USA|US|UK|GBR|CAN|AUS|DEU|FRA|ESP|ITA|JPN|CHN|IND|PAK|BGD|PHL|EGY|SAU|ARE)/i
    ]

    for (const pattern of nationalityPatterns) {
      const match = upperText.match(pattern)
      if (match && match[1]) {
        let nationality = match[1]
        // Normalize common variations
        const normalizations: {[key: string]: string} = {
          'USA': 'American', 'US': 'American',
          'UK': 'British', 'GBR': 'British',
          'CAN': 'Canadian', 'AUS': 'Australian',
          'DEU': 'German', 'FRA': 'French',
          'IND': 'Indian'
        }
        nationality = normalizations[nationality] || nationality
        data.nationality = nationality
        break
      }
    }

    // Sex extraction
    const sexPatterns = [
      /(?:SEX|GENDER)\s*:?\s*(M|F|MALE|FEMALE)/i,
      /^(M|F)$/m
    ]

    for (const pattern of sexPatterns) {
      const match = cleanText.match(pattern)
      if (match && match[1]) {
        data.sex = match[1].toUpperCase().startsWith('M') ? 'M' : 'F'
        break
      }
    }

    // Place of birth
    const pobPatterns = [
      /(?:PLACE\s+OF\s+BIRTH|BORN\s+IN)\s*:?\s*([A-Z][A-ZÀ-ÿ\s,]{5,50})/i,
      /BIRTH\s+PLACE\s*:?\s*([A-Z][A-ZÀ-ÿ\s,]{5,50})/i
    ]

    for (const pattern of pobPatterns) {
      const match = cleanText.match(pattern)
      if (match && match[1]) {
        data.placeOfBirth = match[1].trim()
        break
      }
    }

    return data
  }, [])

  // Auto-analyze text when it changes
  useEffect(() => {
    if (manualText.trim().length > 10) {
      const analyzed = analyzeText(manualText)
      setExtractedData(analyzed)
    } else {
      setExtractedData(null)
    }
  }, [manualText, analyzeText])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.size > maxFileSize * 1024 * 1024) {
      setError(`File too large. Maximum size: ${maxFileSize}MB`)
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setFile(selectedFile)
    setError(null)
    setManualText('')
    setExtractedData(null)
    setManualData({})
    setShowManualEntry(false)
    setActiveStep('text')

    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    toast.success('Image loaded! Now enter the text you see in the document.')
  }, [maxFileSize])

  // Handle text extraction
  const handleExtractData = useCallback(() => {
    if (!manualText.trim()) {
      toast.error('Please enter some text first')
      return
    }

    const extracted = analyzeText(manualText)
    setExtractedData(extracted)
    setActiveStep('extract')
    
    if (onDataExtracted) {
      onDataExtracted(extracted)
    }
    
    const count = Object.values(extracted).filter(v => v).length
    if (count > 0) {
      toast.success(`Data extracted! Found ${count} fields from your text.`)
    } else {
      toast.warning('No structured data found. Try manual entry below.')
      setShowManualEntry(true)
    }
  }, [manualText, analyzeText, onDataExtracted])

  // Handle manual data submission
  const handleManualSubmit = useCallback(() => {
    if (Object.values(manualData).some(v => v)) {
      setExtractedData(manualData)
      if (onDataExtracted) {
        onDataExtracted(manualData)
      }
      const count = Object.values(manualData).filter(v => v).length
      toast.success(`Manual entry complete! ${count} fields entered.`)
      setShowManualEntry(false)
      setActiveStep('extract')
    } else {
      toast.error('Please enter at least one field.')
    }
  }, [manualData, onDataExtracted])

  // Clear all data
  const handleClear = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    setManualText('')
    setExtractedData(null)
    setError(null)
    setShowManualEntry(false)
    setActiveStep('upload')
    setManualData({})
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Copy text to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${activeStep === 'upload' ? 'text-primary' : activeStep !== 'upload' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${activeStep === 'upload' ? 'border-primary bg-primary/10' : activeStep !== 'upload' ? 'border-green-600 bg-green-600/10' : 'border-muted-foreground'}`}>
                {activeStep !== 'upload' ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="font-medium">Upload Image</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            
            <div className={`flex items-center gap-2 ${activeStep === 'text' ? 'text-primary' : activeStep === 'extract' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${activeStep === 'text' ? 'border-primary bg-primary/10' : activeStep === 'extract' ? 'border-green-600 bg-green-600/10' : 'border-muted-foreground'}`}>
                {activeStep === 'extract' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="font-medium">Enter Text</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            
            <div className={`flex items-center gap-2 ${activeStep === 'extract' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${activeStep === 'extract' ? 'border-primary bg-primary/10' : 'border-muted-foreground'}`}>
                3
              </div>
              <span className="font-medium">Extract Data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            <CardTitle>{title}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: File Upload */}
          {activeStep === 'upload' && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${file ? 'border-green-300 bg-green-50 dark:bg-green-950/20' : 'border-border hover:border-primary'}
                ${error ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium">Upload passport/ID document image</p>
                  <p className="text-sm text-muted-foreground">
                    Step 1: Upload your document image to see it while typing
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPG, PNG, WebP • Max {maxFileSize}MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Text Entry */}
          {activeStep === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Instructions</p>
                  <p>Look at your document image below and type the text you see. The system will automatically extract passport data as you type!</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-text">
                  Enter text from document (type exactly what you see)
                </Label>
                <Textarea
                  id="manual-text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Type the text you see in the passport/ID document...

Example:
PASSPORT
United States of America
Name: JOHN SMITH
Passport No: 123456789
Date of Birth: 15/03/1985
Nationality: AMERICAN
..."
                  className="min-h-32"
                />
                <p className="text-xs text-muted-foreground">
                  {manualText.length} characters • Data extraction happens automatically as you type
                </p>
              </div>

              {manualText.trim().length > 10 && extractedData && Object.keys(extractedData).length > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Auto-detected {Object.keys(extractedData).filter(key => extractedData[key as keyof ExtractedData]).length} fields!
                    </span>
                  </div>
                  <div className="text-xs text-green-600 space-y-1">
                    {Object.entries(extractedData).map(([key, value]) => (
                      value && (
                        <div key={key}>
                          • {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleExtractData} className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Extract Data from Text
                </Button>
                <Button variant="outline" onClick={() => setShowManualEntry(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-600">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Document Preview</Label>
              <div className="border rounded-lg p-2 bg-muted/20">
                <img 
                  src={previewUrl} 
                  alt="Document preview" 
                  className="max-w-full h-auto max-h-96 mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {file && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear & Start Over
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      {showManualEntry && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <CardTitle>Manual Data Entry</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowManualEntry(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter passport/ID information manually if automatic extraction didn't work well.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manual-passport">Passport Number</Label>
                <Input
                  id="manual-passport"
                  value={manualData.passportNumber || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, passportNumber: e.target.value }))}
                  placeholder="Enter passport number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-name">Full Name</Label>
                <Input
                  id="manual-name"
                  value={manualData.name || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-nationality">Nationality</Label>
                <Input
                  id="manual-nationality"
                  value={manualData.nationality || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, nationality: e.target.value }))}
                  placeholder="Enter nationality"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-sex">Sex</Label>
                <Input
                  id="manual-sex"
                  value={manualData.sex || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, sex: e.target.value }))}
                  placeholder="M or F"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-birth">Date of Birth</Label>
                <Input
                  id="manual-birth"
                  type="date"
                  value={manualData.dateOfBirth || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-issue">Issue Date</Label>
                <Input
                  id="manual-issue"
                  type="date"
                  value={manualData.issueDate || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-expiry">Expiry Date</Label>
                <Input
                  id="manual-expiry"
                  type="date"
                  value={manualData.expiryDate || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-place">Place of Birth</Label>
                <Input
                  id="manual-place"
                  value={manualData.placeOfBirth || ''}
                  onChange={(e) => setManualData(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                  placeholder="Enter place of birth"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                Cancel
              </Button>
              <Button onClick={handleManualSubmit}>
                Submit Manual Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data */}
      {extractedData && Object.keys(extractedData).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle>Extracted Data</CardTitle>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {Object.keys(extractedData).filter(key => extractedData[key as keyof ExtractedData]).length} fields
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(extractedData).map(([key, value]) => (
                value && (
                  <div key={key} className="space-y-1">
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={value} 
                        readOnly 
                        className="bg-muted/50"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(value)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Text Display */}
      {manualText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle>Entered Text</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(manualText)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={manualText} 
              readOnly 
              className="min-h-24 font-mono text-sm bg-muted/50"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}