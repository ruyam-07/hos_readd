import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { cn, getRiskLevelColor, getRiskLevelBgColor, calculateRiskLevel } from '../utils/helpers';

interface RiskGaugeProps {
  riskScore: number; // 0-1 scale
  riskLevel: 'low' | 'medium' | 'high';
  confidence?: number; // 0-1 scale
  isLoading?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  riskScore,
  riskLevel,
  confidence = 0.85,
  isLoading = false,
  showDetails = true,
  className,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedAngle, setAnimatedAngle] = useState(0);
  
  // Convert 0-1 score to percentage
  const percentageScore = Math.round(riskScore * 100);
  
  // Calculate gauge angle (180 degrees = semicircle)
  const maxAngle = 180;
  const targetAngle = (riskScore * maxAngle) - 90; // -90 to start from left
  
  useEffect(() => {
    if (!isLoading) {
      // Animate the score
      const scoreInterval = setInterval(() => {
        setAnimatedScore(prev => {
          const increment = Math.ceil(percentageScore / 30);
          const next = prev + increment;
          if (next >= percentageScore) {
            clearInterval(scoreInterval);
            return percentageScore;
          }
          return next;
        });
      }, 50);
      
      // Animate the needle
      const angleInterval = setInterval(() => {
        setAnimatedAngle(prev => {
          const increment = maxAngle / 30;
          const next = prev + increment;
          if (next >= targetAngle + 90) {
            clearInterval(angleInterval);
            return targetAngle;
          }
          return next - 90;
        });
      }, 50);
      
      return () => {
        clearInterval(scoreInterval);
        clearInterval(angleInterval);
      };
    }
  }, [isLoading, percentageScore, targetAngle]);
  
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'medium':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };
  
  const getRiskMessage = () => {
    switch (riskLevel) {
      case 'low':
        return 'Low risk for readmission';
      case 'medium':
        return 'Moderate risk for readmission';
      case 'high':
        return 'High risk for readmission';
      default:
        return 'Risk assessment pending';
    }
  };
  
  const getGaugeColor = () => {
    switch (riskLevel) {
      case 'low':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'high':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };
  
  if (isLoading) {
    return (
      <div className={cn("p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20", className)}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-48 h-24 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">Analyzing...</div>
            <div className="text-gray-300">Processing patient data</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20", className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Gauge SVG */}
        <div className="relative w-48 h-24">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Background Arc */}
            <path
              d="M 20 80 A 60 60 0 0 1 180 80"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Risk Level Segments */}
            <path
              d="M 20 80 A 60 60 0 0 1 73 35"
              fill="none"
              stroke="#10B981"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M 73 35 A 60 60 0 0 1 127 35"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M 127 35 A 60 60 0 0 1 180 80"
              fill="none"
              stroke="#EF4444"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />
            
            {/* Animated Progress Arc */}
            <motion.path
              d="M 20 80 A 60 60 0 0 1 180 80"
              fill="none"
              stroke={getGaugeColor()}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(riskScore * 188.5)} 188.5`}
              initial={{ strokeDasharray: '0 188.5' }}
              animate={{ strokeDasharray: `${(riskScore * 188.5)} 188.5` }}
              transition={{ duration: 2, ease: 'easeOut' }}
              filter="url(#glow)"
            />
            
            {/* Glow Filter */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Needle */}
            <motion.line
              x1="100"
              y1="80"
              x2="100"
              y2="30"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ transform: 'rotate(-90deg)' }}
              animate={{ transform: `rotate(${animatedAngle}deg)` }}
              transition={{ duration: 2, ease: 'easeOut' }}
              style={{ transformOrigin: '100px 80px' }}
            />
            
            {/* Center Circle */}
            <circle
              cx="100"
              cy="80"
              r="4"
              fill="white"
            />
            
            {/* Scale Markers */}
            <text x="25" y="95" fill="rgba(255, 255, 255, 0.6)" fontSize="10" textAnchor="middle">0%</text>
            <text x="100" y="25" fill="rgba(255, 255, 255, 0.6)" fontSize="10" textAnchor="middle">50%</text>
            <text x="175" y="95" fill="rgba(255, 255, 255, 0.6)" fontSize="10" textAnchor="middle">100%</text>
          </svg>
        </div>
        
        {/* Risk Score Display */}
        <div className="text-center">
          <motion.div
            className="text-4xl font-bold text-white mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {animatedScore}%
          </motion.div>
          <div className={cn("text-lg font-semibold mb-1", getRiskLevelColor(riskLevel))}>
            {riskLevel.toUpperCase()} RISK
          </div>
          <div className="text-sm text-gray-300 max-w-48">
            {getRiskMessage()}
          </div>
        </div>
        
        {/* Risk Level Indicator */}
        <div className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg border",
          getRiskLevelBgColor(riskLevel),
          riskLevel === 'low' && "border-green-500/30",
          riskLevel === 'medium' && "border-yellow-500/30",
          riskLevel === 'high' && "border-red-500/30"
        )}>
          {getRiskIcon()}
          <span className={cn("font-medium", getRiskLevelColor(riskLevel))}>
            {riskLevel === 'low' && 'Low Risk'}
            {riskLevel === 'medium' && 'Moderate Risk'}
            {riskLevel === 'high' && 'High Risk'}
          </span>
        </div>
        
        {/* Additional Details */}
        {showDetails && (
          <div className="w-full space-y-3">
            {/* Confidence Level */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Confidence Level</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
                <span className="text-white text-sm font-medium">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
            
            {/* Risk Thresholds */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/30">
                <div className="text-green-400 font-medium">Low</div>
                <div className="text-gray-300">0-30%</div>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                <div className="text-yellow-400 font-medium">Medium</div>
                <div className="text-gray-300">30-70%</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/30">
                <div className="text-red-400 font-medium">High</div>
                <div className="text-gray-300">70-100%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};