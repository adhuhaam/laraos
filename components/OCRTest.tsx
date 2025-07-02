import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'

export function OCRTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testTesseractImport = async () => {
    setIsLoading(true)
    try {
      console.log('Testing Tesseract import...')
      const Tesseract = await import('tesseract.js')
      console.log('Tesseract imported:', Tesseract)
      setTestResult('✅ Tesseract.js imported successfully')
      toast.success('Tesseract.js is available')
    } catch (error) {
      console.error('Tesseract import failed:', error)
      setTestResult(`❌ Tesseract import failed: ${error}`)
      toast.error('Tesseract.js import failed')
    } finally {
      setIsLoading(false)
    }
  }

  const testWorkerCreation = async () => {
    setIsLoading(true)
    try {
      console.log('Testing worker creation...')
      const Tesseract = await import('tesseract.js')
      const worker = await Tesseract.createWorker('eng')
      console.log('Worker created:', worker)
      await worker.terminate()
      setTestResult('✅ Tesseract worker created and terminated successfully')
      toast.success('Tesseract worker test passed')
    } catch (error) {
      console.error('Worker creation failed:', error)
      setTestResult(`❌ Worker creation failed: ${error}`)
      toast.error('Worker creation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const testDataExtraction = () => {
    const sampleText = `
PASSPORT
United States of America
Passport No: 123456789
Name: JOHN MICHAEL SMITH
Date of Birth: 15/03/1985
Nationality: AMERICAN
Date of Issue: 10/01/2020
Date of Expiry: 10/01/2030
Place of Birth: NEW YORK, USA
    `.trim()

    // Simple extraction test
    const passportMatch = sampleText.match(/(?:Passport No|No):\s*([A-Z0-9]+)/i)
    const nameMatch = sampleText.match(/Name:\s*([A-Z\s]+)/i)
    const birthMatch = sampleText.match(/Date of Birth:\s*([0-9\/]+)/i)

    const results = {
      passportNumber: passportMatch ? passportMatch[1] : 'Not found',
      name: nameMatch ? nameMatch[1] : 'Not found',
      birthDate: birthMatch ? birthMatch[1] : 'Not found'
    }

    setTestResult(`✅ Extraction test results:
Passport: ${results.passportNumber}
Name: ${results.name}
Birth Date: ${results.birthDate}`)
    toast.success('Data extraction patterns working')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>OCR Debugging Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testTesseractImport} 
            disabled={isLoading}
            variant="outline"
          >
            Test Tesseract Import
          </Button>
          <Button 
            onClick={testWorkerCreation} 
            disabled={isLoading}
            variant="outline"
          >
            Test Worker Creation
          </Button>
          <Button 
            onClick={testDataExtraction} 
            disabled={isLoading}
            variant="outline"
          >
            Test Data Extraction
          </Button>
        </div>

        {testResult && (
          <div className="space-y-2">
            <Badge variant="outline">Test Result</Badge>
            <Textarea 
              value={testResult}
              readOnly
              className="font-mono text-sm"
              rows={10}
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Use these tools to debug OCR functionality:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Test Tesseract Import: Checks if Tesseract.js can be loaded</li>
            <li>Test Worker Creation: Verifies worker initialization</li>
            <li>Test Data Extraction: Tests regex patterns on sample data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}