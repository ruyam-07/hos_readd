
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

# Healthcare Dashboard Authentication System

A modern, secure authentication system for healthcare applications built with Next.js 14, TypeScript, and Supabase. Features beautiful glass morphism design, role-based access control, and comprehensive form validation.

## 🚀 Features

### Authentication
- **Multi-step Registration** - Progressive form with validation
- **Secure Login** - Email/password authentication with JWT tokens
- **Password Reset** - Email-based password recovery
- **Remember Me** - Persistent login sessions
- **Social Login** - Google and GitHub integration (placeholder)
- **Email Verification** - Account activation via email

### Security
- **Role-based Access Control** - Doctor, Nurse, Admin, Patient roles
- **JWT Token Management** - Secure token handling with refresh
- **Form Validation** - Real-time validation with Zod schemas
- **Password Strength** - Visual strength indicator with requirements
- **Route Protection** - AuthGuard component for protected routes

### Design System
- **Glass Morphism** - Modern translucent design
- **Dark Theme** - Professional healthcare aesthetic
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Framer Motion transitions
- **Custom Colors** - Primary blue (#00D4FF) and neon green (#00FF88)

## 🛠️ Technology Stack

- **Next.js 14** - App Router with TypeScript
- **Supabase** - Authentication and database
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Lucide React** - Modern icon library

## 📋 Prerequisites

- Node.js 18.0 or higher
- NPM or Yarn package manager
- Supabase account and project

## 🔧 Installation


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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Enable authentication in the Supabase dashboard
   - Configure email templates (optional)
   - Set up RLS policies for user data

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure


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

│   ├── app/                    # Next.js App Router
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── dashboard/          # Protected dashboard
│   │   └── layout.tsx          # Root layout with providers
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   │   ├── LoginForm.tsx   # Login form component
│   │   │   ├── RegisterForm.tsx # Multi-step registration
│   │   │   └── AuthGuard.tsx   # Route protection wrapper
│   │   └── ui/                 # Reusable UI components
│   │       ├── GlassInput.tsx  # Glass morphism input
│   │       ├── GlassButton.tsx # Glass morphism button
│   │       └── PasswordStrengthIndicator.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── types/
│   │   └── auth.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── validation.ts      # Form validation schemas
│   └── lib/
│       └── supabase.ts        # Supabase client configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
└── package.json               # Project dependencies
```

## 🔐 Authentication Flow

### Registration Process
1. **Step 1: Account Details** - Email and password setup
2. **Step 2: Personal Information** - Name, phone, and role selection
3. **Step 3: Professional Details** - Department and license (for medical staff)

### Login Process
1. Email/password validation
2. JWT token generation
3. Role-based dashboard redirect
4. Session persistence (optional)

### Role-Based Access
- **Patient** - Personal health records access
- **Nurse** - Patient care and monitoring
- **Doctor** - Full medical practice access
- **Admin** - System administration

## 🎨 Design System

### Colors
- **Primary**: #00D4FF (Cyan blue)
- **Secondary**: #00FF88 (Neon green)
- **Glass**: Semi-transparent overlays
- **Dark**: Various shades for backgrounds

### Components
- **GlassInput**: Translucent input fields with validation
- **GlassButton**: Glass morphism buttons with loading states
- **PasswordStrengthIndicator**: Visual password requirements
- **AuthGuard**: Route protection wrapper

### Animations
- **Framer Motion**: Smooth page transitions
- **Glass Effects**: Backdrop blur and gradients
- **Loading States**: Animated loading indicators

## 📝 Usage Examples

### Basic Authentication
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome, {user.user_metadata.first_name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes
```tsx
import AuthGuard from '@/components/auth/AuthGuard';

function ProtectedPage() {
  return (
    <AuthGuard requiredRole="doctor">
      <div>Doctor-only content</div>
    </AuthGuard>
  );
}
```

### Form Validation
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/utils/validation';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

## 🔧 Configuration

### Supabase Setup
1. Create user profiles table
2. Set up RLS policies
3. Configure email templates
4. Enable social providers (optional)

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `NEXTAUTH_SECRET`: Secret for JWT signing

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📱 Responsive Design

The authentication system is fully responsive:
- **Mobile**: Stacked layouts, full-width forms
- **Tablet**: Optimized spacing and typography
- **Desktop**: Multi-column layouts, enhanced animations

## 🔒 Security Features

- **JWT Tokens**: Secure authentication tokens
- **Password Requirements**: Enforced complexity rules
- **Rate Limiting**: Protection against brute force
- **CSRF Protection**: Built-in Next.js security
- **Input Sanitization**: XSS prevention

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Similar to Vercel
- **Railway**: Full-stack deployment
- **Docker**: Containerized deployment


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


**Note:** This is a demonstration system. For production use, ensure proper backend integration, security measures, and compliance with your organization's HIPAA requirements.

4. Add tests if necessary
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues

## 🔮 Future Enhancements

- [ ] Two-factor authentication
- [ ] Biometric authentication
- [ ] Advanced audit logging
- [ ] SSO integration
- [ ] Mobile app support
- [ ] Advanced role permissions



Built with ❤️ for the healthcare community

