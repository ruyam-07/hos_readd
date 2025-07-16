import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';
import { ClinicalRecommendation } from '../types';
import { cn, getRecommendationPriorityColor, getRecommendationCategoryIcon } from '../utils/helpers';

interface RecommendationCardsProps {
  recommendations: ClinicalRecommendation[];
  isLoading?: boolean;
  className?: string;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  recommendations,
  isLoading = false,
  className,
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'medication' | 'monitoring' | 'intervention' | 'discharge'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesPriority = filterPriority === 'all' || rec.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || rec.category === filterCategory;
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesCategory && matchesSearch;
  });

  // Sort by priority
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const toggleExpanded = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white">Generating recommendations...</div>
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
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Clinical Recommendations</h3>
        </div>
        <div className="text-sm text-gray-400">
          {filteredRecommendations.length} of {recommendations.length} recommendations
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recommendations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     backdrop-blur-sm transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Priority:</span>
          </div>
          {(['all', 'high', 'medium', 'low'] as const).map(priority => (
            <button
              key={priority}
              onClick={() => setFilterPriority(priority)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm transition-all",
                filterPriority === priority
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
              )}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Category:</span>
          </div>
          {(['all', 'medication', 'monitoring', 'intervention', 'discharge'] as const).map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm transition-all",
                filterCategory === category
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all",
                getRecommendationPriorityColor(recommendation.priority)
              )}
              onClick={() => toggleExpanded(recommendation.id)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getRecommendationCategoryIcon(recommendation.category)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(recommendation.priority)}
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      recommendation.priority === 'high' && "bg-red-500/20 text-red-400",
                      recommendation.priority === 'medium' && "bg-yellow-500/20 text-yellow-400",
                      recommendation.priority === 'low' && "bg-blue-500/20 text-blue-400"
                    )}>
                      {recommendation.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium bg-white/10",
                    recommendation.category === 'medication' && "text-green-400",
                    recommendation.category === 'monitoring' && "text-blue-400",
                    recommendation.category === 'intervention' && "text-purple-400",
                    recommendation.category === 'discharge' && "text-orange-400"
                  )}>
                    {recommendation.category}
                  </span>
                  {expandedCard === recommendation.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="mt-3">
                <h4 className="text-lg font-semibold text-white mb-2">
                  {recommendation.title}
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  {recommendation.description}
                </p>

                {/* Basic Info */}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{recommendation.timeframe}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{recommendation.responsible}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedCard === recommendation.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-white/20"
                    >
                      <div className="space-y-4">
                        {/* Rationale */}
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">Rationale</h5>
                          <p className="text-sm text-gray-300">{recommendation.rationale}</p>
                        </div>

                        {/* Evidence */}
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">Evidence</h5>
                          <p className="text-sm text-gray-300">{recommendation.evidence}</p>
                        </div>

                        {/* Action Items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-white/5 rounded-lg">
                            <h6 className="text-sm font-medium text-white mb-1">Timeframe</h6>
                            <p className="text-sm text-gray-300">{recommendation.timeframe}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg">
                            <h6 className="text-sm font-medium text-white mb-1">Responsible</h6>
                            <p className="text-sm text-gray-300">{recommendation.responsible}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-2">
                          <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 
                                           text-green-400 rounded-lg text-sm transition-colors">
                            Mark as Done
                          </button>
                          <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 
                                           text-blue-400 rounded-lg text-sm transition-colors">
                            Add to Plan
                          </button>
                          <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 
                                           text-purple-400 rounded-lg text-sm transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg">No recommendations match your filters</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="text-red-400 text-sm">High Priority</div>
          <div className="text-white text-xl font-bold">
            {recommendations.filter(r => r.priority === 'high').length}
          </div>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="text-yellow-400 text-sm">Medium Priority</div>
          <div className="text-white text-xl font-bold">
            {recommendations.filter(r => r.priority === 'medium').length}
          </div>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="text-blue-400 text-sm">Low Priority</div>
          <div className="text-white text-xl font-bold">
            {recommendations.filter(r => r.priority === 'low').length}
          </div>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="text-green-400 text-sm">Total</div>
          <div className="text-white text-xl font-bold">
            {recommendations.length}
          </div>
        </div>
      </div>
    </div>
  );
};