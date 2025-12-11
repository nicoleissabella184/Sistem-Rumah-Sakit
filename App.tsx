import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, ShieldCheck, Database } from 'lucide-react';
import { AgentId, Message, ChatState } from './types';
import { AGENTS, mapAgentNameToId } from './constants';
import { coordinateRequest, simulateSubAgentResponse } from './services/geminiService';
import { AgentCard } from './components/AgentCard';
import { ChatMessage } from './components/ChatMessage';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        content: 'Selamat datang di MedAgent. Saya adalah Koordinator Sistem Rumah Sakit. Silakan sampaikan kebutuhan Anda terkait pasien, rekam medis, tagihan, atau jadwal.',
        timestamp: new Date(),
        agentId: AgentId.MASTER
      }
    ],
    isProcessing: false,
    activeAgent: AgentId.MASTER,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSend = async () => {
    if (!input.trim() || chatState.isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // 1. Add User Message
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isProcessing: true,
      activeAgent: AgentId.MASTER // Reset to master for routing
    }));
    setInput('');

    try {
      // 2. Call Gemini (Master Agent)
      const routingData = await coordinateRequest(userMsg.content);
      
      if (routingData) {
        const targetAgentId = mapAgentNameToId(routingData.chosen_subagent);

        // 3. Add Master's Routing Message (Hidden logic shown via metadata)
        // We technically don't show a text response from Master, we show the routing action.
        // But for chat flow, let's show the system acknowledging the routing.
        
        // 4. Update state to show we are now activating the sub-agent
        setChatState(prev => ({
          ...prev,
          activeAgent: targetAgentId
        }));

        // Simulate network delay for sub-agent
        await new Promise(r => setTimeout(r, 800));

        // 5. Get Sub-agent simulated response
        const subAgentResponseText = await simulateSubAgentResponse(
          AGENTS[targetAgentId].name, 
          routingData.context_passed
        );

        const subAgentMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: subAgentResponseText,
          timestamp: new Date(),
          agentId: targetAgentId,
          routingDetails: routingData, // Attach routing info to this response
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, subAgentMsg],
          isProcessing: false,
          activeAgent: AgentId.MASTER // Return to rest state
        }));

      } else {
        // Fallback error handling
        throw new Error("Routing failed");
      }

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: "Maaf, terjadi kesalahan dalam memproses permintaan Anda. Silakan coba lagi.",
        timestamp: new Date(),
        agentId: AgentId.MASTER
      };
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isProcessing: false,
        activeAgent: AgentId.MASTER
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50">
      {/* Sidebar / Visualizer Panel */}
      <div className="md:w-1/3 lg:w-1/4 bg-slate-100 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-indigo-600" />
            MedAgent Core
          </h1>
          <p className="text-xs text-slate-500 mt-1">Sistem Terintegrasi RS Berbasis AI</p>
        </div>

        {/* Master Agent - Top of Hierarchy */}
        <div className="flex justify-center">
          <div className="w-full max-w-[200px]">
             <AgentCard 
                config={AGENTS[AgentId.MASTER]} 
                isActive={chatState.activeAgent === AgentId.MASTER} 
                isProcessing={chatState.isProcessing && chatState.activeAgent === AgentId.MASTER}
             />
          </div>
        </div>

        {/* Connection Lines Visual */}
        <div className="relative h-8 w-full flex justify-center items-center">
           <div className="absolute h-full w-[2px] bg-slate-300"></div>
           <div className="absolute w-4/5 h-[2px] bg-slate-300 top-1/2"></div>
        </div>

        {/* Sub Agents Grid */}
        <div className="grid grid-cols-2 gap-4">
          <AgentCard 
            config={AGENTS[AgentId.PATIENT]} 
            isActive={chatState.activeAgent === AgentId.PATIENT} 
            isProcessing={chatState.isProcessing}
          />
          <AgentCard 
            config={AGENTS[AgentId.RECORDS]} 
            isActive={chatState.activeAgent === AgentId.RECORDS}
            isProcessing={chatState.isProcessing}
          />
          <AgentCard 
            config={AGENTS[AgentId.BILLING]} 
            isActive={chatState.activeAgent === AgentId.BILLING}
            isProcessing={chatState.isProcessing}
          />
          <AgentCard 
            config={AGENTS[AgentId.SCHEDULING]} 
            isActive={chatState.activeAgent === AgentId.SCHEDULING}
            isProcessing={chatState.isProcessing}
          />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200">
           <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <ShieldCheck size={14} />
              <span>HIPAA / UU PDP Compliant</span>
           </div>
           <div className="flex items-center gap-2 text-xs text-slate-400">
              <Database size={14} />
              <span>Connected to SIMRS via HL7 FHIR</span>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
          <div>
            <h2 className="font-semibold text-slate-800">Pusat Komando Operasional</h2>
            <p className="text-xs text-slate-500">
              {chatState.isProcessing ? 'Sedang memproses permintaan...' : 'Siap menerima perintah'}
            </p>
          </div>
          <div className="text-xs font-mono bg-slate-50 px-3 py-1 rounded border border-slate-200 text-slate-500">
            v1.0.4-beta
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-50/50">
          <div className="max-w-3xl mx-auto">
            {chatState.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
             {chatState.isProcessing && (
              <div className="flex justify-start mb-6 w-full">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                   <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
                   </div>
                   <span className="text-xs text-slate-400 font-medium">Koordinator sedang merutekan...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Contoh: 'Jadwalkan janji temu Dr. Sari' atau 'Cek tagihan pasien ID 123'..."
              className="w-full bg-slate-50 text-slate-800 rounded-xl pl-4 pr-14 py-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-16 shadow-inner text-sm"
              disabled={chatState.isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatState.isProcessing}
              className={`
                absolute right-3 top-3 p-2 rounded-lg transition-all duration-200
                ${!input.trim() || chatState.isProcessing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105'}
              `}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">
               Sistem ini menggunakan AI untuk koordinasi. Verifikasi data medis kritis secara manual sesuai prosedur RS.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
