import React from 'react';
import { AgentConfig, AgentId } from '../types';
import { BrainCircuit, UserPlus, FileHeart, Receipt, CalendarClock, Activity } from 'lucide-react';

interface AgentCardProps {
  config: AgentConfig;
  isActive: boolean;
  isProcessing?: boolean;
}

const IconMap: Record<string, React.FC<any>> = {
  BrainCircuit,
  UserPlus,
  FileHeart,
  Receipt,
  CalendarClock,
};

export const AgentCard: React.FC<AgentCardProps> = ({ config, isActive, isProcessing }) => {
  const Icon = IconMap[config.iconName] || Activity;
  const activeClass = isActive 
    ? `ring-2 ring-offset-2 ring-indigo-500 scale-105 shadow-lg` 
    : `opacity-70 grayscale hover:grayscale-0 hover:opacity-100`;

  return (
    <div className={`
      relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 bg-white border border-slate-200
      ${activeClass}
    `}>
      <div className={`p-3 rounded-full text-white mb-3 ${config.color} ${isProcessing && isActive ? 'animate-pulse' : ''}`}>
        <Icon size={24} />
      </div>
      <h3 className="font-semibold text-sm text-slate-800 text-center">{config.name}</h3>
      <p className="text-xs text-slate-500 text-center mt-1">{config.description}</p>
      
      {isActive && isProcessing && (
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
        </span>
      )}
    </div>
  );
};
