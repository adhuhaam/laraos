# HR Operations System (HRoS) - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Features & Modules](#features--modules)
4. [File Structure](#file-structure)
5. [Setup & Installation](#setup--installation)
6. [User Guide](#user-guide)
7. [Component Documentation](#component-documentation)
8. [API Documentation](#api-documentation)
9. [Theme System](#theme-system)
10. [Development Guidelines](#development-guidelines)
11. [Future Enhancements](#future-enhancements)

---

## Project Overview

The **HR Operations System (HRoS)** is a comprehensive HR management platform designed specifically for construction companies operating in the Maldives. The system handles complete employee lifecycle management, expatriate documentation, project site allocation, and island transfer operations.

### Key Objectives
- Streamline HR operations for construction projects
- Manage expatriate work permits and documentation
- Handle staff transfers between islands efficiently
- Maintain comprehensive employee records
- Provide real-time analytics and reporting

### Target Users
- HR Managers and Staff
- Project Managers
- Planning Engineers
- Recruitment Agents
- Site Supervisors

---

## Architecture & Technology Stack

### Frontend Technologies
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework with custom design system
- **Framer Motion** - Advanced animations and transitions
- **Shadcn/UI** - Pre-built component library
- **Lucide React** - Modern icon library
- **React Hook Form** - Form state management
- **Date-fns** - Date manipulation utilities
- **Sonner** - Toast notifications

### Backend Technologies
- **Laravel 10** - PHP framework for API backend
- **PHP 8.2+** - Server-side scripting
- **MySQL/PostgreSQL** - Database management
- **Laravel Sanctum** - API authentication

### Development Tools
- **Vite** - Build tool and development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

### Design System
- **Professional Color Palette** - Navy blues, whites, grays
- **Glass Morphism Effects** - Modern UI aesthetics
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme switching capability

---

## Features & Modules

### 1. Authentication System
- **Dual Login System**: HR Staff and Recruitment Agents
- **Password Reset Functionality**
- **Session Management**
- **Role-based Access Control**

### 2. Employee Management (7 Core Modules)
#### Employee Register
- Complete employee profile management
- Personal information and documentation
- Employment history tracking
- Document upload and management

#### Employee Status Management
- **Termination Module**: Handle involuntary separations
- **Resignation Module**: Process voluntary departures
- **Missing Employee Module**: Track missing staff
- **Retirement Module**: Manage retirement processes
- **Deceased Employee Module**: Handle unfortunate circumstances
- **Company Change Module**: Internal transfers between companies

### 3. XPAT Management (4 Core Modules)
#### Work Permit Medical
- **9 Status Tracking System**:
  - Pending, Expired, Expiring Soon
  - Medical Center Visited, Medical Report Received
  - Medical Uploaded to XPAT, Medical Incomplete
  - Medical Approved, Completed
- Medical appointment scheduling
- Document upload and tracking

#### Insurance Management
- **4 Status System**: Pending, Expired, Expiring, Paid/Completed
- Insurance policy tracking
- Premium payment management
- Coverage verification

#### Work Permit Processing
- **6 Status System**: Pending, Expired, Expiring, Pending Payment, Collection Created, Paid/Completed
- **Collection Creation Feature**: Fixed rate MVR 350/month/person
- Permit renewal tracking
- Government liaison management

#### VISA Sticker Management
- VISA application processing
- Sticker collection tracking
- Expiry date management

### 4. Site Allocation & Island Transfer
#### Site Allocation System
- Project site management
- Staff allocation to projects
- Performance tracking
- Resource optimization

#### Island Transfer System
- **Comprehensive Transfer Management**:
  - Departure and arrival tracking
  - Transport modes: Seaplane, Speedboat, Ferry, Domestic Flights
  - Real-time status monitoring
  - Priority levels (Low, Medium, High, Urgent)
  - Multi-employee selection
  - Accommodation arrangements
- **20 Maldivian Islands Support**
- **7 Transfer Statuses**: Scheduled, Departed, In-Transit, Arrived, Completed, Cancelled, Delayed

### 5. Disciplinary Actions (2 Modules)
#### Disciplinary Letters
- Letter template system
- Violation tracking
- Progressive discipline management
- Document generation and storage

#### Disciplinary Fines
- Fine calculation and tracking
- Payment processing
- Appeal management
- Record keeping

### 6. Recruitment Management (8 Modules)
#### Candidate Pipeline
- **View Candidates**: Complete candidate database
- **Offer Pending**: Track job offers
- **Ready to Submit**: Pre-submission verification
- **Collection**: Document collection management
- **Tickets**: Travel arrangement management
- **Onboarding**: New employee integration
- **Agent Management**: Recruitment agency coordination
- **Slot Assignment**: Position allocation system

### 7. Quota Management (2 Modules)
#### Quota Pools
- Work permit quota tracking
- Nationality-based allocation
- Usage monitoring and optimization

#### Slot Designation
- Position-specific quota management
- Skill-based allocation
- Project requirement matching

### 8. HR Handbook Management
- **PDF Document Management**: Upload, view, and organize company handbooks
- **Advanced Search System**: Full-text search across documents
- **Version Control**: Track document revisions and changes
- **Category Organization**: Organize by policy types
- **Bookmark System**: Save frequently accessed documents
- **Analytics Tracking**: Monitor document usage and views
- **Status Management**: Draft, Active, Archived, Under Review

### 9. Analytics & Reporting
- Real-time dashboard metrics
- Employee statistics tracking
- Project allocation reports
- XPAT status summaries
- Transfer analytics
- Performance indicators

### 10. System Administration
#### User Management
- User account creation and management
- Profile management
- Access control

#### Role Management
- Role-based permissions
- Access level configuration
- Security management

#### Theme System
- Light/Dark mode switching
- Professional color schemes
- Accessibility compliance

---

## File Structure

```
HR-Operations-System/
├── App.tsx                          # Main application entry point
├── documentation.md                 # This documentation file
├── Guidelines.md                    # Development guidelines
├── THEME_SYSTEM.md                 # Theme system documentation
├── SLOT_ASSIGNMENT_SYSTEM.md       # Slot assignment documentation
├── Attributions.md                 # Third-party attributions
│
├── components/                      # React components
│   ├── figma/                      # Figma-specific components
│   │   └── ImageWithFallback.tsx   # Image component with fallback
│   ├── ui/                         # Shadcn/UI components (42 components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── Dashboard.tsx               # Main dashboard component
│   ├── LoginPage.tsx              # Authentication pages
│   ├── AgentLogin.tsx
│   ├── WelcomeIntro.tsx
│   │
│   ├── HRDataContext.tsx          # Global state management
│   ├── ThemeProvider.tsx          # Theme management
│   ├── ThemeToggle.tsx
│   ├── ThemeDemo.tsx
│   │
│   ├── EmployeeRegister.tsx       # Employee management components
│   ├── EmployeeTermination.tsx
│   ├── EmployeeResignation.tsx
│   ├── EmployeeMissing.tsx
│   ├── EmployeeRetirement.tsx
│   ├── EmployeeDead.tsx
│   ├── EmployeeCompanyChange.tsx
│   │
│   ├── WorkPermitMedical.tsx      # XPAT management components
│   ├── XpatInsurance.tsx
│   ├── WorkPermit.tsx
│   ├── VisaSticker.tsx
│   │
│   ├── SiteAllocation.tsx         # Site and transfer management
│   ├── IslandTransfer.tsx
│   │
│   ├── DisciplinaryLetter.tsx     # Disciplinary management
│   ├── DisciplinaryFines.tsx
│   │
│   ├── ViewCandidates.tsx         # Recruitment components
│   ├── OfferPending.tsx
│   ├── ReadyToSubmit.tsx
│   ├── Collection.tsx
│   ├── Tickets.tsx
│   ├── Onboarding.tsx
│   ├── AgentManagement.tsx
│   ├── SlotAssignment.tsx
│   │
│   ├── QuotaPools.tsx             # Quota management
│   ├── SlotDesignation.tsx
│   │
│   ├── HRHandbook.tsx             # Document management
│   │
│   ├── UserManagement.tsx         # System administration
│   ├── RoleManagement.tsx
│   ├── Reports.tsx
│   ├── HRChat.tsx
│   └── ...
│
├── styles/
│   └── globals.css                 # Global styles and theme system
│
├── app/                           # Laravel backend structure
│   └── Http/
│       ├── Controllers/
│       │   ├── AuthController.php
│       │   └── DashboardController.php
│       └── Middleware/
│           └── CheckAuth.php
│
├── resources/                     # Laravel resources
│   ├── css/app.css
│   ├── js/app.js
│   └── views/
│
├── routes/
│   └── web.php                    # Laravel routes
│
├── package.json                   # Node.js dependencies
├── composer.json                  # PHP dependencies
└── vite.config.js                # Build configuration
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- PHP 8.2+
- Composer
- MySQL/PostgreSQL database
- Web server (Apache/Nginx)

### Frontend Setup
```bash
# Clone the repository
git clone <repository-url>
cd hr-operations-system

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup (Laravel)
```bash
# Install PHP dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
php artisan db:seed

# Start Laravel server
php artisan serve
```

### Environment Variables
```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hr_operations
DB_USERNAME=root
DB_PASSWORD=

# Application Settings
APP_NAME="HR Operations System"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost

# Mail Configuration (for notifications)
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
```

---

## User Guide

### Getting Started

#### 1. System Access
- **HR Staff Login**: Main system access for HR operations
- **Agent Portal**: Recruitment agent access for candidate management
- **Welcome Tutorial**: First-time user onboarding

#### 2. Dashboard Navigation
- **Collapsible Sidebar**: Space-efficient navigation
- **Search Functionality**: Global search across modules
- **Quick Actions**: Frequently used operations
- **Status Overview**: Real-time system metrics

### Core Workflows

#### Employee Lifecycle Management
1. **Registration**: Add new employee with complete profile
2. **Document Management**: Upload and organize employee documents
3. **Status Tracking**: Monitor employment status changes
4. **Termination/Resignation**: Process departures with proper documentation

#### XPAT Documentation Process
1. **Medical Processing**: Track medical examination status
2. **Insurance Setup**: Manage insurance policies and payments
3. **Work Permit Application**: Handle government documentation
4. **VISA Processing**: Manage VISA applications and renewals

#### Island Transfer Operations
1. **Transfer Planning**: Schedule staff movements between islands
2. **Transport Coordination**: Arrange seaplane, speedboat, or ferry transport
3. **Status Monitoring**: Track transfer progress in real-time
4. **Accommodation Management**: Coordinate housing arrangements

#### Document Management (HR Handbook)
1. **Upload Documents**: Add PDF handbooks and policies
2. **Organize Content**: Categorize documents by type
3. **Search & Access**: Find documents quickly with advanced search
4. **Version Control**: Track document revisions and updates

### Advanced Features

#### Quota Management
- Monitor work permit quotas by nationality
- Track usage and availability
- Optimize allocation strategies

#### Analytics & Reporting
- Real-time dashboard metrics
- Export capabilities for external reporting
- Historical data analysis

#### Multi-User Collaboration
- Role-based access control
- Team communication features
- Audit trails for accountability

---

## Component Documentation

### Core Architecture Components

#### App.tsx
- **Purpose**: Main application entry point
- **Features**: Page routing, state management, authentication flow
- **Key States**: currentPage, currentAgent, authentication status

#### Dashboard.tsx
- **Purpose**: Main system dashboard and navigation hub
- **Features**: Sidebar navigation, search, theme switching, module routing
- **Key Features**: Responsive design, collapsible sidebar, real-time statistics

#### HRDataContext.tsx
- **Purpose**: Global state management for HR data
- **Features**: Employee data, candidate management, system-wide state
- **Key Functions**: Data persistence, state updates, API integration points

### Authentication Components

#### LoginPage.tsx
- **Features**: Dual login system, password reset, form validation
- **Security**: Input sanitization, secure authentication flow

#### AgentLogin.tsx
- **Features**: Agent-specific authentication, portal access
- **Integration**: Separate authentication flow for recruitment agents

### Employee Management Components

#### EmployeeRegister.tsx
- **Features**: Complete employee profile creation, document upload, OCR integration
- **Validation**: Form validation, required field checking, data integrity

#### Employee Status Components
- **EmployeeTermination.tsx**: Involuntary separation processing
- **EmployeeResignation.tsx**: Voluntary departure handling
- **EmployeeMissing.tsx**: Missing employee tracking and investigation
- **EmployeeRetirement.tsx**: Retirement process management
- **EmployeeDead.tsx**: Deceased employee record management
- **EmployeeCompanyChange.tsx**: Internal company transfers

### XPAT Management Components

#### WorkPermitMedical.tsx
- **Features**: 9-status tracking system, medical appointment scheduling
- **Integration**: Medical center coordination, document management

#### XpatInsurance.tsx
- **Features**: 4-status system, premium tracking, policy management
- **Automation**: Expiry notifications, renewal reminders

#### WorkPermit.tsx
- **Features**: 6-status system, collection creation (MVR 350/month)
- **Government Integration**: Permit application processing, fee calculation

#### VisaSticker.tsx
- **Features**: VISA application tracking, sticker collection management
- **Timeline**: Application to completion tracking

### Site Management Components

#### SiteAllocation.tsx
- **Features**: Project site management, staff allocation optimization
- **Analytics**: Performance tracking, resource utilization

#### IslandTransfer.tsx
- **Features**: Comprehensive transfer management, 20 Maldivian islands support
- **Transport Modes**: Seaplane, speedboat, ferry, domestic flights
- **Status Tracking**: 7-status system with real-time updates

### Document Management

#### HRHandbook.tsx
- **Features**: PDF upload/viewing, advanced search, version control
- **Organization**: Category-based filing, bookmark system
- **Analytics**: Usage tracking, view statistics

### UI Components (Shadcn/UI)
- **42 Professional Components**: Buttons, cards, dialogs, forms, tables, etc.
- **Accessibility**: WCAG compliance, keyboard navigation
- **Theming**: Dark/light mode support, consistent styling

---

## API Documentation

### Authentication Endpoints
```php
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Employee Management Endpoints
```php
GET    /api/employees              # List employees
POST   /api/employees              # Create employee
GET    /api/employees/{id}         # Get employee details
PUT    /api/employees/{id}         # Update employee
DELETE /api/employees/{id}         # Delete employee
POST   /api/employees/{id}/documents # Upload documents
```

### XPAT Management Endpoints
```php
GET    /api/xpat/medical           # Medical status tracking
POST   /api/xpat/medical/{id}/update # Update medical status
GET    /api/xpat/insurance         # Insurance management
GET    /api/xpat/work-permits      # Work permit tracking
GET    /api/xpat/visa-stickers     # VISA processing
```

### Transfer Management Endpoints
```php
GET    /api/transfers              # List transfers
POST   /api/transfers              # Create transfer
PUT    /api/transfers/{id}         # Update transfer
GET    /api/transfers/{id}/status  # Get transfer status
```

### Document Management Endpoints
```php
GET    /api/documents              # List documents
POST   /api/documents/upload       # Upload document
GET    /api/documents/{id}         # Get document
DELETE /api/documents/{id}         # Delete document
GET    /api/documents/search       # Search documents
```

---

## Theme System

### Design Philosophy
- **Professional Aesthetic**: Navy blues, whites, grays color scheme
- **Glass Morphism**: Modern translucent effects
- **Accessibility First**: WCAG compliance, keyboard navigation
- **Responsive Design**: Mobile-first approach

### Color System
```css
/* Light Mode */
--primary: #1e40af;           /* Navy blue */
--secondary: #f8fafc;         /* Light gray */
--background: #ffffff;        /* White */
--foreground: #0f172a;        /* Dark text */

/* Dark Mode */
--primary: #3b82f6;           /* Bright blue */
--secondary: #334155;         /* Dark gray */
--background: #0f172a;        /* Dark navy */
--foreground: #f8fafc;        /* Light text */
```

### Typography
```css
/* Font Stack */
font-family: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif

/* Scale */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
```

### Animation System
- **Smooth Transitions**: 0.2s cubic-bezier easing
- **Page Transitions**: Framer Motion animations
- **Micro-interactions**: Hover states, loading animations
- **Reduced Motion**: Respects user preferences

---

## Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **Component Structure**: Functional components with hooks
- **State Management**: React Context for global state
- **Error Handling**: Comprehensive error boundaries

### File Organization
```
components/
├── [FeatureName].tsx        # Main feature component
├── [FeatureName]Dialog.tsx   # Dialog components
├── [FeatureName]Card.tsx     # Card components
└── ui/                       # Reusable UI components
```

### Naming Conventions
- **Components**: PascalCase (e.g., `EmployeeManagement`)
- **Files**: PascalCase for components, kebab-case for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### Best Practices
1. **Component Composition**: Prefer composition over inheritance
2. **Performance**: Use React.memo for expensive components
3. **Accessibility**: Include ARIA labels and keyboard navigation
4. **Error Handling**: Graceful error handling with user feedback
5. **Testing**: Unit tests for critical business logic

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature-name
git add .
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name

# Pull request for code review
# Merge after approval
```

---

## Future Enhancements

### Planned Features
1. **Mobile Application**: React Native companion app
2. **Advanced Analytics**: Machine learning insights
3. **Integration APIs**: Third-party system integration
4. **Workflow Automation**: Automated processes and notifications
5. **Multi-language Support**: Dhivehi language support
6. **Advanced OCR**: AI-powered document processing
7. **Digital Signatures**: Electronic document signing
8. **Blockchain Integration**: Secure document verification

### Technical Improvements
1. **Performance Optimization**: Code splitting, lazy loading
2. **PWA Features**: Offline functionality, push notifications
3. **Advanced Search**: Elasticsearch integration
4. **Real-time Updates**: WebSocket implementation
5. **Advanced Security**: Two-factor authentication, encryption
6. **Backup Systems**: Automated backup and recovery
7. **Load Balancing**: Scalable infrastructure
8. **Monitoring**: Application performance monitoring

### User Experience Enhancements
1. **Voice Commands**: Voice-controlled navigation
2. **Smart Suggestions**: AI-powered recommendations
3. **Collaborative Features**: Real-time collaboration tools
4. **Advanced Filtering**: Machine learning-based filtering
5. **Predictive Analytics**: Forecast hiring needs
6. **Custom Dashboards**: User-configurable interfaces
7. **Mobile Optimization**: Enhanced mobile experience
8. **Accessibility**: Enhanced screen reader support

---

## System Requirements

### Minimum Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Screen Resolution**: 1024x768 minimum
- **Internet**: Broadband connection for optimal performance
- **RAM**: 4GB minimum for smooth operation

### Recommended Requirements
- **Browser**: Latest version of modern browsers
- **Screen Resolution**: 1920x1080 or higher
- **Internet**: High-speed broadband connection
- **RAM**: 8GB+ for optimal performance

### Server Requirements
- **PHP**: 8.2 or higher
- **MySQL**: 8.0 or PostgreSQL 13+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Storage**: 10GB+ for documents and database
- **Memory**: 2GB+ RAM for server operations

---

## Support & Maintenance

### Documentation Updates
- Regular updates to reflect new features
- Version-specific documentation
- Migration guides for updates

### Bug Reporting
- Issue tracking system
- Priority classification
- Response time commitments

### Training & Support
- User training materials
- Video tutorials
- Technical support documentation

### Backup & Recovery
- Automated daily backups
- Disaster recovery procedures
- Data retention policies

---

## Conclusion

The HR Operations System (HRoS) represents a comprehensive solution for modern HR management in the construction industry, specifically tailored for operations in the Maldives. With its extensive feature set, professional design, and scalable architecture, the system provides a solid foundation for efficient HR operations while maintaining the flexibility to adapt to evolving business needs.

The system's modular design, comprehensive documentation, and professional implementation make it suitable for organizations of various sizes, from small construction companies to large enterprise operations.

For technical support, feature requests, or additional documentation, please refer to the development team or system administrators.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: HR Operations Development Team