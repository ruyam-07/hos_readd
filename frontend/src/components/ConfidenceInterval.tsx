import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Target, TrendingUp, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { cn, formatConfidenceInterval, calculateConfidenceWidth, isHighConfidence } from '../utils/helpers';

interface ConfidenceIntervalProps {
  lower: number; // 0-1 scale
  upper: number; // 0-1 scale
  confidence: number; // 0-1 scale (e.g., 0.95 for 95%)
  prediction: number; // 0-1 scale
  isLoading?: boolean;
  className?: string;
}

export const ConfidenceInterval: React.FC<ConfidenceIntervalProps> = ({
  lower,
  upper,
  confidence,
  prediction,
  isLoading = false,
  className,
}) => {
  const width = calculateConfidenceWidth(lower, upper);
  const isHighConf = isHighConfidence(lower, upper);
  
  // Convert to percentages for display
  const lowerPercent = Math.round(lower * 100);
  const upperPercent = Math.round(upper * 100);
  const predictionPercent = Math.round(prediction * 100);
  const confidencePercent = Math.round(confidence * 100);
  
  // Create chart data
  const chartData = [
    {
      name: 'Confidence Interval',
      lower: lowerPercent,
      upper: upperPercent,
      prediction: predictionPercent,
      width: upperPercent - lowerPercent,
    },
  ];
  
  const getConfidenceLevel = () => {
    if (confidencePercent >= 95) return 'high';
    if (confidencePercent >= 80) return 'medium';
    return 'low';
  };
  
  const getConfidenceColor = () => {
    const level = getConfidenceLevel();
    switch (level) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#EF4444';
      default: return '#6B7280';
    }
  };
  
  const getConfidenceIcon = () => {
    const level = getConfidenceLevel();
    switch (level) {
      case 'high': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-400" />;
      case 'low': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getInterpretation = () => {
    if (isHighConf) {
      return "The model is highly confident in this prediction. The narrow confidence interval suggests reliable results.";
    } else if (width > 0.5) {
      return "The model has low confidence in this prediction. The wide confidence interval suggests high uncertainty.";
    } else {
      return "The model has moderate confidence in this prediction. Consider additional clinical context.";
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm p-4 rounded-lg border border-white/20 shadow-xl">
          <div className="text-white font-semibold mb-2">Confidence Interval</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Lower bound:</span>
              <span className="text-white">{lowerPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Upper bound:</span>
              <span className="text-white">{upperPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Prediction:</span>
              <span className="text-white">{predictionPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Confidence:</span>
              <span className="text-white">{confidencePercent}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <div className={cn("p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20", className)}>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white">Calculating confidence...</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Confidence Interval</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getConfidenceIcon()}
          <span className={cn(
            "text-sm font-medium",
            getConfidenceLevel() === 'high' && "text-green-400",
            getConfidenceLevel() === 'medium' && "text-yellow-400",
            getConfidenceLevel() === 'low' && "text-red-400"
          )}>
            {confidencePercent}% Confidence
          </span>
        </div>
      </div>
      
      {/* Visual Confidence Interval */}
      <div className="mb-6">
        <div className="relative">
          {/* Background scale */}
          <div className="w-full h-8 bg-gray-700/30 rounded-lg relative">
            {/* Scale markers */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <span className="text-xs text-gray-400">0%</span>
              <span className="text-xs text-gray-400">25%</span>
              <span className="text-xs text-gray-400">50%</span>
              <span className="text-xs text-gray-400">75%</span>
              <span className="text-xs text-gray-400">100%</span>
            </div>
            
            {/* Confidence interval bar */}
            <motion.div
              className="absolute h-full rounded-lg"
              style={{
                left: `${lowerPercent}%`,
                width: `${upperPercent - lowerPercent}%`,
                backgroundColor: getConfidenceColor(),
                opacity: 0.6,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${upperPercent - lowerPercent}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            
            {/* Prediction point */}
            <motion.div
              className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
              style={{ left: `${predictionPercent}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            />
            
            {/* Prediction marker */}
            <motion.div
              className="absolute -top-8 transform -translate-x-1/2"
              style={{ left: `${predictionPercent}%` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="bg-white text-black px-2 py-1 rounded text-xs font-medium">
                {predictionPercent}%
              </div>
            </motion.div>
          </div>
          
          {/* Interval bounds */}
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-gray-400 mb-1" />
              <span>Lower: {lowerPercent}%</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-gray-400 mb-1" />
              <span>Upper: {upperPercent}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart Visualization */}
      <div className="h-32 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="name"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              label={{ value: 'Risk %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255, 255, 255, 0.7)' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="lower" 
              fill="transparent"
              stackId="interval"
            />
            <Bar 
              dataKey="width" 
              fill={getConfidenceColor()}
              stackId="interval"
              radius={[4, 4, 4, 4]}
              opacity={0.6}
            />
            <ReferenceLine 
              y={predictionPercent} 
              stroke="white" 
              strokeDasharray="2 2"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-sm">Prediction</div>
          <div className="text-white text-xl font-bold">{predictionPercent}%</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-sm">Confidence</div>
          <div className="text-white text-xl font-bold">{confidencePercent}%</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-sm">Interval Width</div>
          <div className="text-white text-xl font-bold">{Math.round(width * 100)}%</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-sm">Precision</div>
          <div className={cn(
            "text-xl font-bold",
            isHighConf ? "text-green-400" : width > 0.5 ? "text-red-400" : "text-yellow-400"
          )}>
            {isHighConf ? "High" : width > 0.5 ? "Low" : "Medium"}
          </div>
        </div>
      </div>
      
      {/* Interpretation */}
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h4 className="text-lg font-semibold text-white">Interpretation</h4>
        </div>
        <p className="text-gray-300 text-sm mb-3">
          {getInterpretation()}
        </p>
        <div className="text-sm text-gray-400">
          <strong>Note:</strong> The confidence interval represents the range of values within which 
          we can be {confidencePercent}% confident that the true risk lies. A narrower interval 
          indicates higher precision in the prediction.
        </div>
      </div>
      
      {/* Confidence Levels Guide */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h5 className="text-white font-semibold mb-3">Confidence Levels Guide</h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-300">
              <strong className="text-green-400">High (≥95%):</strong> Very reliable prediction
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-300">
              <strong className="text-yellow-400">Medium (80-94%):</strong> Moderately reliable
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-300">
              <strong className="text-red-400">Low (&lt;80%):</strong> Use with caution
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};