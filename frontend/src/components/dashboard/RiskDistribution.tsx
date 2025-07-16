import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Filter } from 'lucide-react';
import { RiskDistribution as RiskDistributionType, ChartTooltipProps } from '../../types/dashboard';

interface RiskDistributionProps {
  data: RiskDistributionType[];
  isLoading?: boolean;
}

const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 border border-white/20">
        <p className="text-white font-medium">{data.level}</p>
        <p className="text-primary-cyan">Count: {data.count}</p>
        <p className="text-primary-green">Percentage: {data.percentage}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<{ payload?: any[] }> = ({ payload }) => {
  if (!payload) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-300">{entry.value}</span>
        </motion.div>
      ))}
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="w-32 h-6 bg-gray-600 rounded loading-skeleton" />
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-gray-600 rounded loading-skeleton" />
        <div className="w-8 h-8 bg-gray-600 rounded loading-skeleton" />
      </div>
    </div>
    <div className="h-80 bg-gray-600 rounded loading-skeleton" />
  </div>
);

const RiskDistribution: React.FC<RiskDistributionProps> = ({ data, isLoading = false }) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(-1);
  };

  const handleExport = () => {
    const csvContent = data.map(item => 
      `${item.level},${item.count},${item.percentage}`
    ).join('\n');
    const blob = new Blob([`Risk Level,Count,Percentage\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-distribution.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Risk Distribution</h3>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="p-2 glass-card-hover rounded-lg text-primary-cyan hover:text-white transition-colors"
          >
            <Download size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 glass-card-hover rounded-lg text-primary-green hover:text-white transition-colors"
          >
            <Filter size={20} />
          </motion.button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="count"
              onMouseEnter={(_, index) => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className={`transition-all duration-300 ${
                    activeIndex === index ? 'opacity-100' : 'opacity-80'
                  }`}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-2xl font-bold gradient-text">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </p>
          <p className="text-sm text-gray-400">Total Patients</p>
        </motion.div>
      </div>

      {/* Risk level summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div
              className="w-4 h-4 rounded-full mx-auto mb-2"
              style={{ backgroundColor: item.color }}
            />
            <p className="text-sm text-gray-300">{item.level}</p>
            <p className="text-lg font-semibold text-white">{item.count}</p>
            <p className="text-xs text-gray-500">{item.percentage}%</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskDistribution;