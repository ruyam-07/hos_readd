import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
            Healthcare Dashboard
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Secure, modern healthcare management platform with role-based access control
            and beautiful glass morphism design.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-400/25 transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-glass-light border border-white/20 text-white rounded-xl font-medium hover:border-white/30 transition-all duration-300 backdrop-blur-md"
            >
              Create Account
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-glass-light border border-white/20 rounded-xl backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-2">Role-Based Access</h3>
              <p className="text-white/60">Secure access control for doctors, nurses, and administrators</p>
            </div>
            
            <div className="p-6 bg-glass-light border border-white/20 rounded-xl backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-2">Modern Design</h3>
              <p className="text-white/60">Beautiful glass morphism UI with smooth animations</p>
            </div>
            
            <div className="p-6 bg-glass-light border border-white/20 rounded-xl backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-2">Secure Authentication</h3>
              <p className="text-white/60">JWT tokens, password validation, and email verification</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}