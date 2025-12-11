export enum AgentId {
  MASTER = 'MASTER',
  PATIENT = 'PATIENT',
  RECORDS = 'RECORDS',
  BILLING = 'BILLING',
  SCHEDULING = 'SCHEDULING',
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  description: string;
  color: string;
  iconName: string;
}

export interface RoutingResponse {
  routing_decision: string;
  chosen_subagent: string; // This corresponds to the name in the prompt
  core_function_match: string;
  context_passed: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  agentId?: AgentId; // The agent that "sent" this message
  routingDetails?: RoutingResponse; // Attached if this was a master routing decision
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  activeAgent: AgentId;
}
