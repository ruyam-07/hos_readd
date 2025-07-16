import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, TrendingUp, RefreshCw, Settings, Download } from 'lucide-react';
import { ModelPerformance, ChartTooltipProps } from '../../types/dashboard';

interface ModelComparisonProps {
  models: ModelPerformance[];
  isLoading?: boolean;
}

const GaugeChart: React.FC<{ value: number; title: string; color: string }> = ({ value, title, color }) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-sm text-gray-400">{title}</span>
    </div>
  );
};

const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/20">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-300">{entry.dataKey}:</span>
            <span className="text-sm text-white font-medium">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LoadingSkeleton: React.FC = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="w-40 h-6 bg-gray-600 rounded loading-skeleton" />
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gray-600 rounded loading-skeleton" />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 bg-gray-600 rounded loading-skeleton" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-600 rounded loading-skeleton" />
        ))}
      </div>
    </div>
  </div>
);

const ModelComparison: React.FC<ModelComparisonProps> = ({ models, isLoading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'precision' | 'recall' | 'f1Score'>('accuracy');

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const chartData = models.map(model => ({
    name: model.model,
    accuracy: model.accuracy,
    precision: model.precision,
    recall: model.recall,
    f1Score: model.f1Score,
  }));

  const bestModel = models.reduce((best, current) => 
    current.accuracy > best.accuracy ? current : best
  );

  const metricColors = {
    accuracy: '#00D4FF',
    precision: '#00FF88',
    recall: '#8B5CF6',
    f1Score: '#FF6B6B',
  };

  const handleExport = () => {
    const csvContent = models.map(model => 
      `${model.model},${model.accuracy},${model.precision},${model.recall},${model.f1Score}`
    ).join('\n');
    const blob = new Blob([`Model,Accuracy,Precision,Recall,F1Score\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Model Performance Comparison</h3>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="p-2 glass-card-hover rounded-lg text-primary-cyan hover:text-white transition-colors"
          >
            <Download size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 glass-card-hover rounded-lg text-primary-green hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 glass-card-hover rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={16} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Performance Metrics</h4>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="bg-background-card border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-primary-cyan"
            >
              <option value="accuracy">Accuracy</option>
              <option value="precision">Precision</option>
              <option value="recall">Recall</option>
              <option value="f1Score">F1 Score</option>
            </select>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={selectedMetric} radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={metricColors[selectedMetric]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gauge Charts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Best Model Performance</h4>
            <div className="flex items-center space-x-2">
              <Award size={16} className="text-yellow-400" />
              <span className="text-sm text-gray-400">{bestModel.model}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <GaugeChart 
                value={bestModel.accuracy} 
                title="Accuracy" 
                color={metricColors.accuracy}
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <GaugeChart 
                value={bestModel.precision} 
                title="Precision" 
                color={metricColors.precision}
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <GaugeChart 
                value={bestModel.recall} 
                title="Recall" 
                color={metricColors.recall}
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <GaugeChart 
                value={bestModel.f1Score} 
                title="F1 Score" 
                color={metricColors.f1Score}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Model Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model, index) => (
          <motion.div
            key={model.model}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-4 ${
              model.model === bestModel.model ? 'ring-2 ring-primary-cyan' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-white">{model.model}</h5>
              {model.model === bestModel.model && (
                <Award size={16} className="text-yellow-400" />
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy:</span>
                <span className="text-primary-cyan">{model.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Precision:</span>
                <span className="text-primary-green">{model.precision}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recall:</span>
                <span className="text-primary-purple">{model.recall}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">F1 Score:</span>
                <span className="text-red-400">{model.f1Score}%</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(model.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ModelComparison;