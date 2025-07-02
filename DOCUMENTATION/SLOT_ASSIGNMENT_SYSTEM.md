# Slot Assignment System - HRoS

## Overview
The Slot Assignment System enables HRoS administrators to allocate recruitment quota slots to agents from available quota pools. Agents can only submit candidates within their assigned slot limits.

## Components

### 1. SlotAssignment Component (HRoS Dashboard)
**Location:** `/components/SlotAssignment.tsx`

**Features:**
- View all current slot assignments
- Assign slots from quota pools to agents
- Specify designations and slot counts per assignment
- Track slot usage and remaining availability
- Revoke assignments (if no slots are used)
- Export assignment reports

**Access:** Dashboard → Recruitment → Slot Assignment

### 2. Updated AgentPortal Component
**Location:** `/components/AgentPortal.tsx`

**New Features:**
- **Dashboard Tab:** Overview of assigned and used slots
- **Slot Assignments Tab:** Detailed view of all slot allocations
- **Restricted Candidate Submission:** Only positions with available slots can be selected
- **Real-time Slot Tracking:** Shows remaining slots after each submission
- **Slot Validation:** Prevents submission when no slots are available

## Data Flow

### Slot Assignment Process (HRoS Admin)
1. Admin selects an agent from active agents list
2. Admin selects a quota pool with available slots
3. Admin configures designation-specific slot allocations:
   - Designation name
   - Salary for the designation
   - Number of slots to assign
4. System validates slot availability in quota pool
5. Slots are assigned and quota pool availability is updated

### Candidate Submission Process (Agent Portal)
1. Agent navigates to Add Candidate
2. System displays available designations with remaining slots
3. Agent can only select positions with available slots
4. Upon submission, used slots are incremented
5. Remaining slots are decremented
6. Real-time feedback shows slot usage

## Key Features

### For HRoS Administrators
- **Slot Allocation Control:** Complete control over agent slot assignments
- **Quota Pool Integration:** Seamless integration with existing quota pools
- **Usage Monitoring:** Real-time tracking of slot utilization
- **Assignment Management:** Easy modification and revocation of assignments
- **Reporting:** Export capabilities for assignment analytics

### For Recruitment Agents
- **Slot Visibility:** Clear view of all assigned slots
- **Usage Tracking:** Real-time updates on slot consumption
- **Submission Restrictions:** Automatic enforcement of slot limits
- **Performance Metrics:** Track placement rates within slot allocations
- **Expiry Notifications:** Alert when slot assignments are nearing expiry

## Technical Implementation

### Data Structures

```typescript
interface SlotAssignment {
  id: string
  agentId: string
  agentName: string
  agentCompany: string
  quotaPoolId: string
  quotaPoolName: string
  assignedSlots: {
    designation: string
    salary: number
    totalSlots: number
    usedSlots: number
    remainingSlots: number
  }[]
  totalAssignedSlots: number
  totalUsedSlots: number
  assignedDate: string
  expiryDate?: string
  status: 'active' | 'expired' | 'exhausted'
}
```

### Integration Points

1. **AgentManagement Component:** Source of available agents
2. **QuotaPools Component:** Source of available quota slots
3. **ViewCandidates Component:** Tracks agent-submitted candidates
4. **AgentPortal Component:** Enforces slot restrictions

### Validation Rules

1. **Slot Availability:** Cannot assign more slots than available in quota pool
2. **Active Agents Only:** Only active agents can receive slot assignments
3. **Active Pools Only:** Only active quota pools can be used for assignments
4. **Revocation Restrictions:** Cannot revoke assignments with used slots
5. **Submission Validation:** Agents cannot submit candidates without available slots

## Usage Workflow

### HRoS Administrator Workflow
1. Navigate to Recruitment → Slot Assignment
2. Click "Assign Slots"
3. Select agent and quota pool
4. Configure designation slots
5. Set expiry date (optional)
6. Confirm assignment
7. Monitor usage through assignment table

### Agent Workflow
1. Login to Agent Portal
2. View Dashboard for slot overview
3. Check Slot Assignments tab for details
4. Add candidates within available slots
5. Track usage and performance

## Benefits

### For Organizations
- **Resource Control:** Prevent over-allocation of recruitment resources
- **Performance Tracking:** Monitor agent efficiency within allocated slots
- **Budget Management:** Control recruitment costs through slot limits
- **Compliance:** Ensure recruitment stays within approved quotas

### For Agents
- **Clear Expectations:** Know exactly how many candidates can be submitted
- **Performance Visibility:** Track success rates within allocations
- **Planning Support:** Plan recruitment activities based on slot availability
- **Transparency:** Clear view of all assignments and usage

## Future Enhancements

1. **Auto-Renewal:** Automatic slot renewal based on performance
2. **Slot Sharing:** Allow slots to be shared between agents
3. **Dynamic Pricing:** Variable slot costs based on designation difficulty
4. **Performance Incentives:** Bonus slots for high-performing agents
5. **Predictive Analytics:** Forecast slot requirements based on historical data