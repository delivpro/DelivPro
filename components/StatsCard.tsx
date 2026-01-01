
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down';
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, trend, trendType }) => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendType === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
