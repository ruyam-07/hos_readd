# Hospital Readmission Patient Management System

A comprehensive, HIPAA-compliant patient management system built with React, TypeScript, and Tailwind CSS. This system is designed specifically for hospital readmission tracking with advanced search, filtering, and data visualization capabilities.

## 🏥 Features

### Core Functionality
- **Patient List Management** - Paginated table with 10,000+ records support
- **Advanced Search & Filtering** - Real-time search with debounced input
- **Patient Form Management** - Multi-step form with validation
- **Comprehensive Patient Details** - Complete patient profile view
- **Bulk Operations** - Mass actions on selected patients
- **Export Functionality** - Data export in multiple formats

### HIPAA Compliance
- **Data Masking** - Protected Health Information (PHI) protection
- **Access Control** - Role-based data access
- **Audit Logging** - Complete access tracking
- **Secure Display** - Sensitive data toggle functionality

### User Experience
- **Glass Morphism Design** - Modern, accessible UI
- **Dark Theme** - Eye-friendly interface
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Framer Motion integration
- **Loading States** - Comprehensive feedback
- **Error Handling** - Graceful error management

### Technical Features
- **Server-side Pagination** - Efficient data handling
- **Real-time Search** - 300ms debounced search
- **Advanced Filtering** - Multiple filter criteria
- **Sortable Columns** - Multi-column sorting
- **TypeScript Support** - Full type safety
- **Accessibility** - WCAG 2.1 AA compliant

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── patient/
│   │       ├── PatientList.tsx      # Main patient listing component
│   │       ├── PatientForm.tsx      # Patient creation/editing form
│   │       ├── PatientDetail.tsx    # Patient profile view
│   │       └── PatientSearch.tsx    # Search and filtering component
│   ├── hooks/
│   │   └── usePatients.ts           # Custom hooks for patient management
│   ├── types/
│   │   └── patient.ts               # TypeScript type definitions
│   ├── utils/
│   │   └── hipaa.ts                 # HIPAA compliance utilities
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles and Tailwind imports
├── public/
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🔧 Components

### 1. PatientList

The main patient listing component with advanced features:

```tsx
<PatientList
  onPatientSelect={handlePatientSelect}
  onPatientEdit={handlePatientEdit}
  className="custom-styles"
/>
```

**Features:**
- Paginated table (50 records per page)
- Real-time search and filtering
- Bulk operations (activate, deactivate, export)
- Sortable columns
- Mobile-responsive cards
- HIPAA-compliant data display

### 2. PatientForm

Multi-step patient creation and editing form:

```tsx
<PatientForm
  patient={selectedPatient}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
/>
```

**Features:**
- 4-step form wizard
- React Hook Form integration
- Form validation
- PHI protection toggles
- Auto-save functionality
- Accessibility support

### 3. PatientDetail

Comprehensive patient profile view:

```tsx
<PatientDetail
  patient={selectedPatient}
  onEdit={handleEdit}
  onClose={handleClose}
/>
```

**Features:**
- Tabbed interface (Overview, Medical, Admissions, Insurance)
- Risk score visualization
- Medical history tracking
- Admission records
- Insurance information
- PHI visibility controls

### 4. PatientSearch

Advanced search and filtering component:

```tsx
<PatientSearch
  onSearchChange={handleSearch}
  onFilterChange={handleFilter}
  onPatientSelect={handleSelect}
  showFilters={true}
/>
```

**Features:**
- Real-time autocomplete
- Advanced filtering options
- Age range filtering
- Insurance provider filtering
- Status filtering
- Date range filtering

## 🎨 Styling

### Tailwind CSS Configuration

The project uses a custom Tailwind CSS configuration with:
- Glass morphism utilities
- Medical-themed color palette
- Custom animations
- Responsive design system
- Accessibility enhancements

### Custom CSS Classes

```css
.glass-card         # Glass morphism card
.glass-button       # Glass morphism button
.input-field        # Standardized input styling
.btn-primary        # Primary button styling
.status-badge       # Status indicator styling
.risk-high          # High risk indicator
.risk-medium        # Medium risk indicator
.risk-low           # Low risk indicator
.risk-very-low      # Very low risk indicator
```

## 🔐 HIPAA Compliance

### Data Protection Features

1. **Data Masking**
   - SSN masking: `***-**-1234`
   - Phone masking: `(***) ***-1234`
   - Email masking: `jo***@domain.com`
   - Address masking: `*** City, State`

2. **Access Control**
   - Role-based field access
   - Sensitive data toggles
   - Audit logging

3. **Secure Display**
   - PHI visibility controls
   - Role-based data filtering
   - Secure data transmission

### Usage Example

```tsx
import { formatPatientDisplay, auditPatientAccess } from './utils/hipaa';

// Display patient with HIPAA compliance
const displayPatient = formatPatientDisplay(patient, {
  maskSSN: true,
  maskPhoneNumber: true,
  maskEmail: true,
  maskAddress: true
});

// Audit patient access
auditPatientAccess(patient.id, userId, 'view');
```

## 📊 Data Management

### Patient Data Structure

```typescript
interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  ssn?: string;
  phoneNumber?: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  insurance: Insurance;
  admissionHistory: Admission[];
  medicalHistory: MedicalHistory[];
  riskScore?: number;
  isActive: boolean;
}
```

### Search and Filtering

The system supports advanced search and filtering:

```typescript
interface PatientSearchFilters {
  query?: string;
  gender?: Patient['gender'];
  ageRange?: { min: number; max: number };
  insuranceProvider?: string;
  admissionDateRange?: { start: string; end: string };
  riskScoreRange?: { min: number; max: number };
  isActive?: boolean;
}
```

## 🚀 Performance Optimizations

### Server-side Pagination
- Efficient handling of 10,000+ records
- 50 records per page default
- Jump-to-page functionality
- Loading states during navigation

### Debounced Search
- 300ms delay for search input
- Prevents excessive API calls
- Real-time suggestions
- Auto-complete functionality

### Lazy Loading
- Components loaded on demand
- Reduced initial bundle size
- Improved performance
- Better user experience

## 🧪 Testing

### Running Tests

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
```

## 📱 Mobile Support

The system is fully responsive with:
- Mobile-first design approach
- Touch-friendly interactions
- Responsive tables that convert to cards
- Optimized for tablets and phones
- Swipe gestures support

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus indicators
- ARIA labels and roles
- Color contrast compliance

### Accessibility Features
- Tab navigation
- Focus management
- Semantic HTML
- Alternative text
- Keyboard shortcuts
- Screen reader announcements

## 🔧 Configuration

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_VERSION=1.0.0
VITE_HIPAA_AUDIT_ENDPOINT=/api/audit
```

### Tailwind Configuration

Custom configuration in `tailwind.config.js`:
- Medical color palette
- Glass morphism utilities
- Custom animations
- Responsive breakpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Use semantic commit messages
- Add proper documentation
- Include accessibility considerations
- Test on multiple devices

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact:
- Email: support@hospital-system.com
- Documentation: [Link to docs]
- Issue tracker: [Link to issues]

---

**Note:** This is a demonstration system. For production use, ensure proper backend integration, security measures, and compliance with your organization's HIPAA requirements.