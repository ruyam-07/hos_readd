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

---

Built with ❤️ for the healthcare community