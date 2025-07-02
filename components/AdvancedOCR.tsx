import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  X,
  Copy,
  Eye,
  Scan,
  FileText,
  Settings,
  Zap,
  Camera,
  RefreshCw,
  Sparkles,
  Brain,
  Cloud,
  Edit3
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

interface OCRResult {
  text: string
  confidence: number
  method: string
  processingTime: number
}

interface AdvancedOCRProps {
  onDataExtracted?: (data: ExtractedData) => void
  maxFileSize?: number
  title?: string
  description?: string
}

export function AdvancedOCR({ 
  onDataExtracted,
  maxFileSize = 10,
  title = "Advanced Passport OCR",
  description = "Upload passport images for AI-powered data extraction"
}: AdvancedOCRProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentMethod, setCurrentMethod] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [capabilities, setCapabilities] = useState({
    browserOCR: false,
    cloudOCR: true,
    manualEntry: true
  })
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualData, setManualData] = useState<ExtractedData>({})
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const processingRef = useRef<boolean>(false)

  // Check browser OCR capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      // Check for experimental Text Detection API
      const hasTextDetector = 'TextDetector' in window
      setCapabilities(prev => ({ ...prev, browserOCR: hasTextDetector }))
    }
    checkCapabilities()
  }, [])

  // Advanced image preprocessing
  const preprocessImage = useCallback((file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = canvasRef.current
      
      if (!canvas) {
        reject(new Error('Canvas not available'))
        return
      }
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      img.onload = () => {
        // Set canvas size
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Apply image enhancement
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          
          // Apply contrast enhancement
          const contrast = 1.5
          const enhanced = ((gray - 128) * contrast) + 128
          
          // Apply threshold for better text recognition
          const threshold = enhanced > 128 ? 255 : 0
          
          data[i] = threshold     // Red
          data[i + 1] = threshold // Green
          data[i + 2] = threshold // Blue
          // Alpha channel remains unchanged
        }
        
        // Put processed image back
        ctx.putImageData(imageData, 0, 0)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to process image'))
          }
        }, 'image/png', 0.9)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Browser-native OCR using Text Detection API
  const tryBrowserOCR = useCallback(async (imageBlob: Blob): Promise<OCRResult> => {
    const startTime = Date.now()
    setCurrentMethod('Browser Text Detection')
    
    try {
      // @ts-ignore - TextDetector is experimental
      if ('TextDetector' in window) {
        // @ts-ignore
        const detector = new TextDetector()
        const bitmap = await createImageBitmap(imageBlob)
        const textBlocks = await detector.detect(bitmap)
        
        const text = textBlocks.map((block: any) => block.rawValue).join('\n')
        const confidence = textBlocks.length > 0 ? 85 : 0
        
        return {
          text,
          confidence,
          method: 'Browser Text Detection',
          processingTime: Date.now() - startTime
        }
      }
      throw new Error('Text Detection API not available')
    } catch (error) {
      throw new Error(`Browser OCR failed: ${error}`)
    }
  }, [])

  // Cloud OCR using OCR.space API
  const tryCloudOCR = useCallback(async (imageBlob: Blob): Promise<OCRResult> => {
    const startTime = Date.now()
    setCurrentMethod('Cloud OCR Processing')
    
    try {
      const formData = new FormData()
      formData.append('file', imageBlob, 'passport.png')
      formData.append('apikey', 'K87899142388957') // Free tier API key
      formData.append('language', 'eng')
      formData.append('isOverlayRequired', 'false')
      formData.append('OCREngine', '2') // Use OCR Engine 2 for better accuracy
      formData.append('detectOrientation', 'true')
      formData.append('scale', 'true')
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || 'OCR processing failed')
      }
      
      const text = result.ParsedResults?.[0]?.ParsedText || ''
      const confidence = result.ParsedResults?.[0]?.TextOverlay?.HasError === false ? 90 : 50
      
      return {
        text,
        confidence,
        method: 'OCR.space Cloud API',
        processingTime: Date.now() - startTime
      }
    } catch (error) {
      throw new Error(`Cloud OCR failed: ${error}`)
    }
  }, [])

  // Enhanced data extraction with multiple strategies
  const extractDataFromText = useCallback((text: string): ExtractedData => {
    const data: ExtractedData = {}
    const cleanText = text.replace(/\s+/g, ' ').trim()
    const upperText = cleanText.toUpperCase()
    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    // Passport Number - Enhanced patterns for different countries
    const passportPatterns = [
      // US Format
      /(?:PASSPORT\s*(?:NO|NUMBER|#)?\s*:?\s*)?(\d{9})/i,
      // UK Format
      /(?:PASSPORT\s*(?:NO|NUMBER|#)?\s*:?\s*)?(\d{3}\s?\d{6}|\d{9})/i,
      // EU Formats
      /(?:PASSPORT\s*(?:NO|NUMBER|#)?\s*:?\s*)?([A-Z]{1,3}\d{6,9})/i,
      // General alphanumeric
      /(?:PASSPORT\s*(?:NO|NUMBER|#)?\s*:?\s*)?([A-Z0-9]{6,12})/i,
      // Standalone patterns
      /^([A-Z]{1,3}\d{6,9})$/m,
      /^(\d{8,9})$/m
    ]

    for (const pattern of passportPatterns) {
      const match = upperText.match(pattern)
      if (match && match[1]) {
        const candidate = match[1].replace(/\s/g, '')
        if (candidate.length >= 6 && candidate.length <= 12) {
          data.passportNumber = candidate
          break
        }
      }
    }

    // Name extraction - Multiple strategies
    const namePatterns = [
      // Surname, Given names format
      /(?:NAME|GIVEN|SURNAME)\s*:?\s*([A-Z][A-Z\s]{5,50})/i,
      /(?:GIVEN\s+NAMES?|PRÉNOMS?)\s*:?\s*([A-Z][A-Z\s]{5,50})/i,
      /(?:SURNAME|NOM)\s*:?\s*([A-Z][A-Z\s]{5,50})/i,
      // All caps format (common in machine-readable zones)
      /^([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)$/m,
      // Mixed case
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

    // Date extraction with enhanced patterns
    const datePatterns = [
      // Standard formats
      { pattern: /(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4})/g, format: 'DD/MM/YYYY' },
      { pattern: /(\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2})/g, format: 'YYYY-MM-DD' },
      // Month abbreviations
      { pattern: /(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{4})/gi, format: 'DD MMM YYYY' },
      // Full month names
      { pattern: /(\d{1,2}\s+(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+\d{4})/gi, format: 'DD MONTH YYYY' },
      // Machine readable zone dates (YYMMDD)
      { pattern: /(\d{6})(?=\d|$)/g, format: 'YYMMDD' }
    ]

    const extractedDates: Array<{value: string, context: string, format: string}> = []
    
    datePatterns.forEach(({pattern, format}) => {
      const matches = [...cleanText.matchAll(pattern)]
      matches.forEach(match => {
        if (match[1]) {
          const dateValue = match[1]
          const index = match.index || 0
          const context = cleanText.substring(Math.max(0, index - 25), index + 50).toLowerCase()
          
          // Convert YYMMDD format to readable date
          let processedDate = dateValue
          if (format === 'YYMMDD' && dateValue.length === 6) {
            const yy = parseInt(dateValue.substring(0, 2))
            const mm = parseInt(dateValue.substring(2, 4))
            const dd = parseInt(dateValue.substring(4, 6))
            
            // Assume years 00-30 are 2000s, 31-99 are 1900s
            const year = yy <= 30 ? 2000 + yy : 1900 + yy
            
            if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
              processedDate = `${dd.toString().padStart(2, '0')}/${mm.toString().padStart(2, '0')}/${year}`
            } else {
              return // Skip invalid dates
            }
          }
          
          extractedDates.push({ value: processedDate, context, format })
        }
      })
    })

    // Assign dates based on context
    extractedDates.forEach(({value, context}) => {
      if ((context.includes('birth') || context.includes('born') || context.includes('dob') || context.includes('date of birth')) && !data.dateOfBirth) {
        data.dateOfBirth = value
      } else if ((context.includes('expir') || context.includes('valid') || context.includes('expires')) && !data.expiryDate) {
        data.expiryDate = value
      } else if ((context.includes('issue') || context.includes('delivered') || context.includes('issued')) && !data.issueDate) {
        data.issueDate = value
      }
    })

    // Fallback: assign by position if no context matches
    const uniqueDates = [...new Set(extractedDates.map(d => d.value))]
    if (!data.dateOfBirth && uniqueDates[0]) data.dateOfBirth = uniqueDates[0]
    if (!data.issueDate && uniqueDates[1]) data.issueDate = uniqueDates[1]
    if (!data.expiryDate && uniqueDates[2]) data.expiryDate = uniqueDates[2]

    // Nationality extraction with comprehensive patterns
    const nationalityPatterns = [
      /(?:NATIONALITY|NATIONALITÉ|CITIZEN)\s*:?\s*([A-Z]{3,25})/i,
      // Common nationalities
      /(AMERICAN|BRITISH|CANADIAN|AUSTRALIAN|GERMAN|FRENCH|SPANISH|ITALIAN|JAPANESE|CHINESE|INDIAN|PAKISTANI|BANGLADESHI|FILIPINO|EGYPTIAN|SAUDI|EMIRATI|BRAZILIAN|MEXICAN|RUSSIAN|SOUTH\s+AFRICAN)/i,
      // Country codes
      /(USA|US|UK|GBR|CAN|AUS|DEU|FRA|ESP|ITA|JPN|CHN|IND|PAK|BGD|PHL|EGY|SAU|ARE|BRA|MEX|RUS|ZAF)/i,
      // Additional patterns
      /(UNITED\s+STATES|UNITED\s+KINGDOM|SOUTH\s+AFRICA)/i
    ]

    for (const pattern of nationalityPatterns) {
      const match = upperText.match(pattern)
      if (match && match[1]) {
        let nationality = match[1].replace(/\s+/g, ' ').trim()
        
        // Normalize common variations
        const normalizations: {[key: string]: string} = {
          'USA': 'American', 'US': 'American', 'UNITED STATES': 'American',
          'UK': 'British', 'GBR': 'British', 'UNITED KINGDOM': 'British',
          'CAN': 'Canadian', 'AUS': 'Australian', 'DEU': 'German',
          'FRA': 'French', 'ESP': 'Spanish', 'ITA': 'Italian',
          'JPN': 'Japanese', 'CHN': 'Chinese', 'IND': 'Indian',
          'PAK': 'Pakistani', 'BGD': 'Bangladeshi', 'PHL': 'Filipino',
          'EGY': 'Egyptian', 'SAU': 'Saudi', 'ARE': 'Emirati',
          'BRA': 'Brazilian', 'MEX': 'Mexican', 'RUS': 'Russian',
          'ZAF': 'South African', 'SOUTH AFRICA': 'South African'
        }
        
        nationality = normalizations[nationality] || nationality
        data.nationality = nationality
        break
      }
    }

    // Sex/Gender extraction
    const sexPatterns = [
      /(?:SEX|SEXE|GENDER)\s*:?\s*(M|F|MALE|FEMALE|MASCULIN|FÉMININ)/i,
      /^(M|F)$/m,
      /\b(MALE|FEMALE)\b/i
    ]

    for (const pattern of sexPatterns) {
      const match = cleanText.match(pattern)
      if (match && match[1]) {
        const sex = match[1].toUpperCase()
        data.sex = (sex === 'M' || sex === 'MALE' || sex === 'MASCULIN') ? 'M' : 'F'
        break
      }
    }

    // Place of birth extraction
    const pobPatterns = [
      /(?:PLACE\s+OF\s+BIRTH|LIEU\s+DE\s+NAISSANCE|BORN\s+IN)\s*:?\s*([A-Z][A-Z\s,.-]{5,50})/i,
      /(?:BIRTH\s+PLACE|LIEU\s+NAISSANCE)\s*:?\s*([A-Z][A-Z\s,.-]{5,50})/i
    ]

    for (const pattern of pobPatterns) {
      const match = cleanText.match(pattern)
      if (match && match[1]) {
        data.placeOfBirth = match[1].trim()
        break
      }
    }

    // Issuing authority
    const authorityPatterns = [
      /(?:ISSUING\s+AUTHORITY|AUTORITÉ\s+DE\s+DÉLIVRANCE)\s*:?\s*([A-Z][A-Z\s,.-]{5,50})/i,
      /(?:ISSUED\s+BY|DÉLIVRÉ\s+PAR)\s*:?\s*([A-Z][A-Z\s,.-]{5,50})/i
    ]

    for (const pattern of authorityPatterns) {
      const match = cleanText.match(pattern)
      if (match && match[1]) {
        data.issuingAuthority = match[1].trim()
        break
      }
    }

    return data
  }, [])

  // Main OCR processing function
  const processOCR = useCallback(async () => {
    if (!file || processingRef.current) return

    processingRef.current = true
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setOcrResults([])
    setExtractedData(null)

    try {
      // Step 1: Preprocess image
      setCurrentMethod('Preprocessing image...')
      setProgress(10)
      const processedBlob = await preprocessImage(file)
      
      setProgress(20)
      const attempts: OCRResult[] = []
      
      // Step 2: Try Browser OCR if available
      if (capabilities.browserOCR) {
        try {
          setProgress(30)
          const browserResult = await tryBrowserOCR(processedBlob)
          attempts.push(browserResult)
          setProgress(50)
        } catch (error) {
          console.log('Browser OCR failed:', error)
        }
      }
      
      // Step 3: Try Cloud OCR
      if (capabilities.cloudOCR) {
        try {
          setProgress(60)
          const cloudResult = await tryCloudOCR(processedBlob)
          attempts.push(cloudResult)
          setProgress(80)
        } catch (error) {
          console.log('Cloud OCR failed:', error)
        }
      }
      
      if (attempts.length === 0) {
        throw new Error('All OCR methods failed. Please try manual entry.')
      }
      
      setOcrResults(attempts)
      
      // Step 4: Extract data from best result
      setCurrentMethod('Extracting passport data...')
      setProgress(90)
      
      // Use the result with highest confidence
      const bestResult = attempts.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      )
      
      const extracted = extractDataFromText(bestResult.text)
      setExtractedData(extracted)
      
      if (onDataExtracted) {
        onDataExtracted(extracted)
      }
      
      setProgress(100)
      setCurrentMethod('Complete!')
      
      const fieldCount = Object.values(extracted).filter(v => v).length
      if (fieldCount > 0) {
        toast.success(`OCR successful! Extracted ${fieldCount} fields with ${bestResult.confidence}% confidence.`)
      } else {
        toast.warning('OCR completed but no passport data found. Please try manual entry.')
        setShowManualEntry(true)
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'OCR processing failed')
      toast.error('OCR failed. Please try manual entry.')
      setShowManualEntry(true)
    } finally {
      processingRef.current = false
      setIsProcessing(false)
      if (!extractedData || Object.keys(extractedData).length === 0) {
        setCurrentMethod('')
        setProgress(0)
      }
    }
  }, [file, capabilities, preprocessImage, tryBrowserOCR, tryCloudOCR, extractDataFromText, onDataExtracted, extractedData])

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
    setOcrResults([])
    setExtractedData(null)
    setShowManualEntry(false)
    setProgress(0)
    setCurrentMethod('')
    setManualData({})

    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    toast.success('Image loaded! Ready for OCR processing.')
  }, [maxFileSize])

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
    } else {
      toast.error('Please enter at least one field.')
    }
  }, [manualData, onDataExtracted])

  // Clear all data
  const handleClear = useCallback(() => {
    if (processingRef.current) {
      processingRef.current = false
      setIsProcessing(false)
    }
    
    setFile(null)
    setPreviewUrl(null)
    setOcrResults([])
    setExtractedData(null)
    setError(null)
    setShowManualEntry(false)
    setProgress(0)
    setCurrentMethod('')
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
      {/* Hidden canvas for image preprocessing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Capabilities Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {capabilities.browserOCR && <Badge variant="default" className="gap-1"><Sparkles className="h-3 w-3" />Browser AI</Badge>}
              {capabilities.cloudOCR && <Badge variant="secondary" className="gap-1"><Cloud className="h-3 w-3" />Cloud OCR</Badge>}
              <Badge variant="outline" className="gap-1"><Edit3 className="h-3 w-3" />Manual</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
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
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-600">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Drop passport image here or click to upload</p>
                    <p className="text-sm text-muted-foreground">
                      AI-powered extraction with multiple OCR engines
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, WebP • Max {maxFileSize}MB • Clear, well-lit images work best
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-600">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {file && (
            <div className="flex gap-2">
              <Button 
                onClick={processOCR} 
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {currentMethod || 'Processing...'} {progress > 0 && `${progress}%`}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Extract Passport Data
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowManualEntry(true)}
                disabled={isProcessing}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
              
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentMethod || 'Processing...'}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Using multiple AI engines for best accuracy...
              </p>
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
        </CardContent>
      </Card>

      {/* OCR Results Summary */}
      {ocrResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <CardTitle>OCR Engine Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ocrResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{result.method}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.text.length} characters • {result.processingTime}ms
                  </p>
                </div>
                <Badge variant={result.confidence > 80 ? 'default' : result.confidence > 60 ? 'secondary' : 'destructive'}>
                  {result.confidence}% confidence
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
              Enter passport information manually for 100% accuracy.
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
                  placeholder="Enter full name as shown"
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
                <CardTitle>Extracted Passport Data</CardTitle>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {Object.keys(extractedData).filter(key => extractedData[key as keyof ExtractedData]).length} fields extracted
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

      {/* Raw OCR Text */}
      {ocrResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle>Raw OCR Text</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(ocrResults.map(r => `${r.method}:\n${r.text}`).join('\n\n---\n\n'))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={ocrResults.map(r => `${r.method} (${r.confidence}% confidence):\n${r.text}`).join('\n\n---\n\n')}
              readOnly 
              className="min-h-48 font-mono text-sm bg-muted/50"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}