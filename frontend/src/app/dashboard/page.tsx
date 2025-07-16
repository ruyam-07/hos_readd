'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import GlassButton from '@/components/ui/GlassButton';
import { motion } from 'framer-motion';
import { User, LogOut, Shield, Settings } from 'lucide-react';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/60">Welcome back, {user?.user_metadata?.first_name}!</p>
          </div>
          <GlassButton
            onClick={logout}
            variant="outline"
            icon={<LogOut className="w-5 h-5" />}
          >
            Logout
          </GlassButton>
        </div>

        {/* User Info Card */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
              </h2>
              <p className="text-white/60">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-400 font-medium capitalize">
                  {user?.user_metadata?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Phone</label>
              <p className="text-white">{user?.user_metadata?.phone || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Department</label>
              <p className="text-white">{user?.user_metadata?.department || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Patients</h3>
            <p className="text-white/60 text-sm mb-4">Manage patient records and appointments</p>
            <GlassButton size="sm" className="w-full">
              View Patients
            </GlassButton>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Appointments</h3>
            <p className="text-white/60 text-sm mb-4">Schedule and manage appointments</p>
            <GlassButton size="sm" className="w-full">
              View Calendar
            </GlassButton>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
            <p className="text-white/60 text-sm mb-4">Configure your preferences</p>
            <GlassButton 
              size="sm" 
              variant="outline" 
              className="w-full"
              icon={<Settings className="w-4 h-4" />}
            >
              Settings
            </GlassButton>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Activity item {i}</p>
                  <p className="text-white/60 text-xs">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}