import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardStats from './dashboard/DashboardStats';
import RiskDistribution from './dashboard/RiskDistribution';
import RecentPredictions from './dashboard/RecentPredictions';
import ModelComparison from './dashboard/ModelComparison';
import {
  mockDashboardStats,
  mockRiskDistribution,
  mockPredictions,
  mockTrendData,
  mockModelPerformance,
  generateLivePrediction,
} from '../utils/mockData';
import { Prediction } from '../types/dashboard';

const Dashboard: React.FC = () => {
  const [predictions, setPredictions] = useState(mockPredictions);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrediction = generateLivePrediction();
      setPredictions(prev => [newPrediction, ...prev.slice(0, 9)]);
    }, 10000); // Add new prediction every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Hospital Readmission Prediction Dashboard
          </h1>
          <p className="text-gray-400">
            Real-time analytics and predictions for patient readmission risk
          </p>
        </motion.div>

        {/* Stats Overview */}
        <DashboardStats stats={mockDashboardStats} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Risk Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="xl:col-span-1"
          >
            <RiskDistribution data={mockRiskDistribution} isLoading={isLoading} />
          </motion.div>

          {/* Recent Predictions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="xl:col-span-2"
          >
            <RecentPredictions predictions={predictions} isLoading={isLoading} />
          </motion.div>
        </div>

        {/* Trend Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <TrendAnalysisPlaceholder isLoading={isLoading} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-1"
          >
            <ModelComparison models={mockModelPerformance} isLoading={isLoading} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center py-8"
        >
          <p className="text-gray-500 text-sm">
            © 2024 Hospital Readmission Prediction System. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Temporary placeholder for TrendAnalysis component
const TrendAnalysisPlaceholder: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="w-32 h-6 bg-gray-600 rounded loading-skeleton mb-6" />
        <div className="h-80 bg-gray-600 rounded loading-skeleton" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Trend Analysis</h3>
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Interactive trend charts</p>
          <p className="text-gray-500 text-xs mt-2">Showing prediction trends over time</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;