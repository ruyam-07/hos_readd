import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Prediction } from '../../types/dashboard';

interface RecentPredictionsProps {
  predictions: Prediction[];
  isLoading?: boolean;
}

const RiskBadge: React.FC<{ level: string; score: number }> = ({ level, score }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <XCircle size={14} />;
      case 'medium':
        return <AlertCircle size={14} />;
      case 'low':
        return <CheckCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${getRiskColor(level)}`}>
      {getRiskIcon(level)}
      <span className="text-xs font-medium uppercase">{level}</span>
      <span className="text-xs">({score}%)</span>
    </div>
  );
};

const PredictionCard: React.FC<{ prediction: Prediction; index: number }> = ({ prediction, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card-hover p-4 mb-3 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-cyan/10 rounded-lg">
            <User size={16} className="text-primary-cyan" />
          </div>
          <div>
            <p className="font-medium text-white">{prediction.patientName}</p>
            <p className="text-sm text-gray-400">ID: {prediction.patientId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <RiskBadge level={prediction.riskLevel} score={prediction.riskScore} />
          <div className="flex items-center space-x-1 text-gray-400">
            <Clock size={14} />
            <span className="text-xs">
              {new Date(prediction.predictedDate).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 border-t border-white/10 pt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-primary-cyan mb-2">Risk Factors</p>
                <div className="space-y-1">
                  {prediction.factors.map((factor, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-green rounded-full" />
                      <span className="text-sm text-gray-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-purple mb-2">Confidence</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-cyan to-primary-purple h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm text-white">{prediction.confidence}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="w-40 h-6 bg-gray-600 rounded loading-skeleton" />
      <div className="w-20 h-6 bg-gray-600 rounded loading-skeleton" />
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-lg loading-skeleton" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-600 rounded loading-skeleton" />
                <div className="w-16 h-3 bg-gray-600 rounded loading-skeleton" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-6 bg-gray-600 rounded-full loading-skeleton" />
              <div className="w-12 h-4 bg-gray-600 rounded loading-skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RecentPredictions: React.FC<RecentPredictionsProps> = ({ predictions, isLoading = false }) => {
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Predictions</h3>
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-primary-green rounded-full"
          />
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {predictions.map((prediction, index) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="mx-auto mb-2 text-gray-500" size={48} />
          <p className="text-gray-400">No recent predictions</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm text-gray-400 text-center">
          Showing {predictions.length} recent predictions • Updates every 5 seconds
        </p>
      </div>
    </motion.div>
  );
};

export default RecentPredictions;