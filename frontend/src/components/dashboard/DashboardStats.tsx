import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Target, AlertTriangle, Activity } from 'lucide-react';
import { DashboardStats as DashboardStatsType } from '../../types/dashboard';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  isLoading?: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  colorClass: string;
  delay: number;
}> = ({ title, value, change, icon, colorClass, delay }) => {
  const isPositive = change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card-hover p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-primary-green' : 'text-red-400'}`}>
          <TrendIcon size={16} />
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      
      {/* Animated background glow */}
      <motion.div
        className={`absolute inset-0 opacity-5 ${colorClass}`}
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-600 rounded-lg loading-skeleton" />
        <div className="space-y-2">
          <div className="w-24 h-4 bg-gray-600 rounded loading-skeleton" />
          <div className="w-16 h-6 bg-gray-600 rounded loading-skeleton" />
        </div>
      </div>
      <div className="w-12 h-4 bg-gray-600 rounded loading-skeleton" />
    </div>
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Predictions Today',
      value: stats.totalPredictions.toLocaleString(),
      change: stats.changeFromYesterday.predictions,
      icon: <Activity className="w-6 h-6 text-primary-cyan" />,
      colorClass: 'neon-glow bg-primary-cyan/10',
      delay: 0,
    },
    {
      title: 'Average Risk Score',
      value: `${stats.averageRiskScore.toFixed(1)}%`,
      change: stats.changeFromYesterday.riskScore,
      icon: <Target className="w-6 h-6 text-primary-green" />,
      colorClass: 'neon-glow-green bg-primary-green/10',
      delay: 0.1,
    },
    {
      title: 'High Risk Patients',
      value: stats.highRiskPatients,
      change: stats.changeFromYesterday.highRisk,
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      colorClass: 'bg-red-400/10 border border-red-400/20',
      delay: 0.2,
    },
    {
      title: 'Model Accuracy',
      value: `${stats.modelAccuracy.toFixed(1)}%`,
      change: stats.changeFromYesterday.accuracy,
      icon: <Users className="w-6 h-6 text-primary-purple" />,
      colorClass: 'neon-glow-purple bg-primary-purple/10',
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};

export default DashboardStats;