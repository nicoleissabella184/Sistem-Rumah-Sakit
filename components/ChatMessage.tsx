import React from 'react';
import { Message, AgentId } from '../types';
import { AGENTS } from '../constants';
import { Bot, User, ArrowRight, BrainCircuit } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Determine identity style
  const agent = message.agentId ? AGENTS[message.agentId] : AGENTS[AgentId.MASTER];
  const avatarColor = isUser ? 'bg-slate-700' : agent.color;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${avatarColor} shadow-sm`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            px-4 py-3 rounded-2xl text-sm shadow-sm
            ${isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}
          `}>
            {message.content}
          </div>

          {/* Metadata / Routing Info */}
          {!isUser && message.routingDetails && (
            <div className="mt-2 text-xs bg-slate-100 p-2 rounded-lg border border-slate-200 w-full animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-2 text-slate-600 font-medium mb-1">
                <BrainCircuit size={12} />
                <span>Keputusan Perutean:</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">MASTER</span>
                <ArrowRight size={10} className="text-slate-400" />
                <span className="font-semibold text-indigo-600">{message.routingDetails.chosen_subagent}</span>
              </div>
              <p className="mt-2 text-slate-500 italic border-l-2 border-indigo-200 pl-2">
                "{message.routingDetails.core_function_match}"
              </p>
            </div>
          )}

          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};