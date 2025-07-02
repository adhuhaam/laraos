import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Search, RefreshCw, Download, Skull, Calendar, Eye, Users, FileText } from 'lucide-react'

interface DeathRecord {
  id: string
  employeeName: string
  empId: string
  department: string
  designation: string
  deathDate: string
  causeOfDeath: string
  familyNotified: boolean
  benefitsClaimed: boolean
  insuranceClaimed: boolean
  documentStatus: 'pending' | 'complete'
}

export function EmployeeDead() {
  const [deathRecords] = useState<DeathRecord[]>([
    {
      id: '1',
      employeeName: 'Hassan Ali',
      empId: 'EMP012',
      department: 'Construction',
      designation: 'Construction Worker',
      deathDate: '2024-11-15',
      causeOfDeath: 'Natural causes',
      familyNotified: true,
      benefitsClaimed: true,
      insuranceClaimed: true,
      documentStatus: 'complete'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredRecords = useMemo(() => {
    return deathRecords.filter(record => 
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.empId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [deathRecords, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deceased Employees</h1>
          <p className="text-muted-foreground">
            Maintain records of deceased employees • {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Skull className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deathRecords.length}</div>
            <p className="text-xs text-muted-foreground">Deceased employees</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Death Date</TableHead>
              <TableHead>Cause</TableHead>
              <TableHead>Benefits Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium">{record.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.empId} • {record.designation}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>{new Date(record.deathDate).toLocaleDateString()}</TableCell>
                <TableCell>{record.causeOfDeath}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      {record.benefitsClaimed ? '✅' : '❌'} Benefits
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {record.insuranceClaimed ? '✅' : '❌'} Insurance
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}