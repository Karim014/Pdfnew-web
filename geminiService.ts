
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure GEMINI_API_KEY is configured.");
  }
  return new GoogleGenAI({ apiKey });
};

export const chatWithGemini = async (messages: { role: string; text: string }[]) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are StudyFlow Assistant, a professional AI tutor. Use Markdown for all formatting. Be concise, organized, and helpful. If a user asks for flashcards, format them as a JSON block wrapped in ```json tags.',
    },
  });

  const lastMessage = messages[messages.length - 1].text;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};

export const performOCR = async (fileBase64: string, mimeType: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: fileBase64, mimeType } },
        { text: "Perform high-accuracy OCR. Output only the extracted plain text." }
      ]
    },
  });
  return response.text;
};

export const analyzeDocument = async (fileBase64: string, mimeType: string, task: string) => {
  const ai = getAIClient();
  const prompts: Record<string, string> = {
    summarize: "Summarize this document with bold headers and bullet points using Markdown. Make it readable for a student.",
    flashcards: "Extract key concepts and return them ONLY as a JSON array of objects. Each object MUST have 'front' and 'back' properties. Wrap the array in a markdown code block labeled as json: ```json [ { \"front\": \"...\", \"back\": \"...\" } ] ```. Do not add any other text.",
    quiz: "Create a 5-question multiple choice quiz using Markdown. Label questions with numbers and options with a, b, c, d. Put the answer key at the bottom.",
    explain: "Explain the main concepts of this document simply using analogies and Markdown formatting."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: fileBase64, mimeType } },
        { text: prompts[task] || prompts.explain }
      ]
    },
  });
  return response.text;
};
