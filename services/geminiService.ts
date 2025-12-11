import { GoogleGenAI, Schema, Type } from "@google/genai";
import { MASTER_AGENT_SYSTEM_INSTRUCTION } from "../constants";
import { RoutingResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for the Master Agent
const routingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    routing_decision: { type: Type.STRING },
    chosen_subagent: { type: Type.STRING },
    core_function_match: { type: Type.STRING },
    context_passed: { type: Type.STRING },
  },
  required: ["routing_decision", "chosen_subagent", "core_function_match", "context_passed"],
};

export const coordinateRequest = async (userMessage: string): Promise<RoutingResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using Flash for responsiveness in this UI demo
      contents: userMessage,
      config: {
        systemInstruction: MASTER_AGENT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: routingSchema,
        temperature: 0.1, // Low temperature for deterministic routing
      },
    });

    const text = response.text;
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
