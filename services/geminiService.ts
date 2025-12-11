import { GoogleGenerativeAI } from "@google/generative-ai";
import { MASTER_AGENT_SYSTEM_INSTRUCTION } from "../constants";
import { RoutingResponse } from "../types";

// Initialize Gemini Client
// Get API key from environment variables (works both in build and dev)
const apiKey = typeof window === 'undefined' 
  ? (process.env.API_KEY || "")
  : ((window as any).__ENV__?.VITE_API_KEY || (window as any).__ENV__?.API_KEY || "");

const genAI = new GoogleGenerativeAI(apiKey);

export const coordinateRequest = async (userMessage: string): Promise<RoutingResponse | null> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${MASTER_AGENT_SYSTEM_INSTRUCTION}\n\nUser request: ${userMessage}\n\nRespond in JSON format with routing_decision, chosen_subagent, core_function_match, and context_passed fields.`,
            },
          ],
        },
      ],
    });

    const text = response.response.text();
    if (!text) return null;

    try {
      const data = JSON.parse(text) as RoutingResponse;
      return data;
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return null;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// Simulation of sub-agents processing the request
export const simulateSubAgentResponse = async (agentName: string, context: string): Promise<string> => {
  // In a real app, this would call specific endpoints or RAG pipelines.
  // Here we simulate network latency and a canned response based on the context.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[${agentName}] telah menerima permintaan Anda: "${context}". \n\n✅ Data sedang diproses. Sistem telah memperbarui basis data internal sesuai protokol rumah sakit.`);
    }, 1500);
  });
};
