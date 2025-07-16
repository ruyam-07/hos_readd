import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Info, Eye, EyeOff } from 'lucide-react';
import { FeatureImportance as FeatureImportanceType } from '../types';
import { cn, getFeatureCategoryColor, formatFeatureName, getTopFeatures } from '../utils/helpers';

interface FeatureImportanceProps {
  features: FeatureImportanceType[];
  isLoading?: boolean;
  showTop?: number;
  className?: string;
}

export const FeatureImportance: React.FC<FeatureImportanceProps> = ({
  features,
  isLoading = false,
  showTop = 10,
  className,
}) => {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureImportanceType | null>(null);
  
  // Get top features and format for chart
  const topFeatures = getTopFeatures(features, showAllFeatures ? features.length : showTop);
  const chartData = topFeatures.map(feature => ({
    ...feature,
    formattedName: formatFeatureName(feature.feature),
    color: getFeatureCategoryColor(feature.feature.split('_')[0]),
    absImportance: Math.abs(feature.importance),
  }));
  
  const maxImportance = Math.max(...chartData.map(d => d.absImportance));
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-sm p-4 rounded-lg border border-white/20 shadow-xl">
          <div className="text-white font-semibold mb-2">{data.formattedName}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Importance:</span>
              <span className="text-white">{data.absImportance.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Value:</span>
              <span className="text-white">{data.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Contribution:</span>
              <span className={cn(
                "font-medium",
                data.contribution > 0 ? "text-red-400" : "text-green-400"
              )}>
                {data.contribution > 0 ? '+' : ''}{data.contribution.toFixed(3)}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 max-w-48">
            {data.description}
          </div>
        </div>
      );
    }
    return null;
  };
  
  const handleBarClick = (data: any) => {
    setSelectedFeature(data);
  };
  
  if (isLoading) {
    return (
      <div className={cn("p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white">Analyzing feature importance...</div>
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
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Feature Importance</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 
                     rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            {showAllFeatures ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">
              {showAllFeatures ? 'Show Top' : 'Show All'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="formattedName"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              label={{ value: 'Importance (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255, 255, 255, 0.7)' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="absImportance" 
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={selectedFeature?.feature === entry.feature ? 1 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Feature List */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white mb-4">Top Contributing Features</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {topFeatures.map((feature, index) => (
            <motion.div
              key={feature.feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                selectedFeature?.feature === feature.feature 
                  ? "bg-blue-500/20 border-blue-500/50" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
              onClick={() => setSelectedFeature(feature)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getFeatureCategoryColor(feature.feature.split('_')[0]) }}
                  />
                  <span className="text-white font-medium">
                    {formatFeatureName(feature.feature)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {feature.contribution > 0 ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white font-medium">
                    {Math.abs(feature.importance).toFixed(1)}%
                  </div>
                  <div className={cn(
                    "text-sm",
                    feature.contribution > 0 ? "text-red-400" : "text-green-400"
                  )}>
                    {feature.contribution > 0 ? '+' : ''}{feature.contribution.toFixed(3)}
                  </div>
                </div>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: getFeatureCategoryColor(feature.feature.split('_')[0]) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(Math.abs(feature.importance) / maxImportance) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Selected Feature Details */}
      {selectedFeature && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-5 h-5 text-blue-400" />
            <h5 className="text-lg font-semibold text-white">
              {formatFeatureName(selectedFeature.feature)}
            </h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <div className="text-gray-300 text-sm">Importance</div>
              <div className="text-white font-semibold">
                {Math.abs(selectedFeature.importance).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm">Current Value</div>
              <div className="text-white font-semibold">
                {selectedFeature.value}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm">Risk Contribution</div>
              <div className={cn(
                "font-semibold",
                selectedFeature.contribution > 0 ? "text-red-400" : "text-green-400"
              )}>
                {selectedFeature.contribution > 0 ? '+' : ''}{selectedFeature.contribution.toFixed(3)}
              </div>
            </div>
          </div>
          
          <div className="text-gray-300 text-sm">
            {selectedFeature.description}
          </div>
          
          <div className="mt-3 flex items-center space-x-2">
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              selectedFeature.contribution > 0 
                ? "bg-red-500/20 text-red-400" 
                : "bg-green-500/20 text-green-400"
            )}>
              {selectedFeature.contribution > 0 ? 'Increases Risk' : 'Decreases Risk'}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h5 className="text-white font-semibold mb-3">Feature Categories</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {[
            { name: 'Demographics', color: getFeatureCategoryColor('demographics') },
            { name: 'Vitals', color: getFeatureCategoryColor('vitals') },
            { name: 'Labs', color: getFeatureCategoryColor('labs') },
            { name: 'History', color: getFeatureCategoryColor('history') },
            { name: 'Admission', color: getFeatureCategoryColor('admission') },
            { name: 'Functional', color: getFeatureCategoryColor('functional') },
          ].map((category) => (
            <div key={category.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-gray-300">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};