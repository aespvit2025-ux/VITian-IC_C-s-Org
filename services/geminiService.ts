
import { GoogleGenAI } from "@google/genai";
import { MOCK_CLUBS, MOCK_EVENTS } from "../constants";

const getSystemInstruction = () => {
  const clubsInfo = MOCK_CLUBS.map(c => `- ${c.name} (${c.category}): ${c.description}`).join('\n');
  const eventsInfo = MOCK_EVENTS.map(e => `- ${e.title} by Club ID ${e.clubId} on ${new Date(e.date).toLocaleDateString()}`).join('\n');

  return `You are the AI Assistant for 'VIT Clubs Hub', a mobile app for Vishwakarma Institute of Technology (VIT) Pune.
  
  Your role is to help students find clubs, understand upcoming events, and navigate student life at VIT.
  
  Here is the current data about clubs:
  ${clubsInfo}
  
  Here are upcoming events:
  ${eventsInfo}
  
  Rules:
  1. Be helpful, enthusiastic, and concise.
  2. If asked about a specific club, provide details from the data.
  3. If asked for recommendations (e.g., "coding clubs"), suggest relevant Technical clubs.
  4. Always maintain a polite and academic tone suitable for a college environment.
  5. If you don't know something, suggest they contact the Student Council.
  `;
};

// Fix: Updated to follow GenAI SDK guidelines for initialization and model selection
export const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    // Fix: Using correct initialization with named apiKey parameter from process.env
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fix: Using 'gemini-3-flash-preview' for basic text tasks and system instruction
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: getSystemInstruction(),
      }
    });

    // Fix: Accessing .text property directly from response
    return response.text || "I didn't catch that. Could you rephrase?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the network. Please try again later.";
  }
};
