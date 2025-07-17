import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, BarChart3, Settings } from 'lucide-react';
import { TrendData, ChartTooltipProps } from '../../types/dashboard';

interface TrendAnalysisProps {
  data: TrendData[];
  isLoading?: boolean;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data, isLoading = false }) => {
  const [timeRange, setTimeRange] = useState('30d');

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="w-32 h-6 bg-gray-600 rounded loading-skeleton mb-6" />
        <div className="h-80 bg-gray-600 rounded loading-skeleton" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Trend Analysis</h3>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-background-card border border-white/10 rounded-lg px-3 py-1 text-sm text-white"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="predictions" stroke="#00D4FF" strokeWidth={3} />
            <Line type="monotone" dataKey="riskScore" stroke="#00FF88" strokeWidth={3} />
            <Line type="monotone" dataKey="accuracy" stroke="#8B5CF6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TrendAnalysis;
