
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationExercise, Subtitle } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async transcribe(base64Data: string, mimeType: string): Promise<string> {
    const ai = getAI();
    try {
      // Basic text tasks like transcription use gemini-3-flash-preview
      // Fixed: contents updated to match preferred object structure for multimodal input
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: "Listen to this media. Output ONLY the spoken words in their original language. No descriptions." }
          ]
        }
      });
      // Directly access .text property as per guidelines
      return response.text?.trim() || "No speech detected.";
    } catch (err: any) {
      return "Error during transcription.";
    }
  },

  async translateText(text: string, targetLang: string): Promise<string> {
    const ai = getAI();
    try {
      // Fixed: contents simplified to string for text-only prompt
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate this text into ${targetLang}. Return ONLY the direct translation.\n\nText: "${text}"`
      });
      return response.text?.trim() || "Translation unavailable.";
    } catch (err) {
      return "Translation service error.";
    }
  },

  async getSubtitles(base64Data: string, mimeType: string, targetLang: string): Promise<Subtitle[]> {
    const ai = getAI();
    try {
      // Fixed: contents updated to single Content object
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: `CRITICAL: TRANSLATE the speech in this media into ${targetLang}. 
            Generate time-stamped subtitles in ${targetLang}. 
            Return ONLY a JSON array of objects with {start: number, end: number, text: string}. 
            'text' MUST be in ${targetLang}.` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                start: { type: Type.NUMBER },
                end: { type: Type.NUMBER },
                text: { type: Type.STRING }
              },
              required: ["start", "end", "text"]
            }
          }
        }
      });
      // Extract text directly; when using responseMimeType, it's typically clean JSON string
      const jsonStr = response.text?.trim() || "[]";
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error("Subtitle error:", err);
      return [];
    }
  },

  async analyzeTranslation(exercise: TranslationExercise, targetLang: string): Promise<any> {
    const ai = getAI();
    try {
      // Complex reasoning task uses gemini-3-pro-preview
      // Fixed: contents simplified to string
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `بصفتك بروفيسور خبير في الترجمة، قارن بين "ترجمة المستخدم" و"الترجمة النموذجية".
          
          الترجمة النموذجية: "${exercise.sourceText}"
          ترجمة المستخدم: "${exercise.userTranslation}"
          اللغة المستهدفة: ${targetLang}
          
          المطلوب JSON يحتوي على:
          1. score: درجة من 100.
          2. aiReference: الترجمة النموذجية الصحيحة.
          3. incorrectWords: مصفوفة الكلمات الخاطئة.
          4. suggestions: مصفوفة من 10 نصائح تعليمية احترافية باللغة العربية حصراً.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              aiReference: { type: Type.STRING },
              incorrectWords: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "aiReference", "incorrectWords", "suggestions"]
          }
        }
      });
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr);
    } catch (err) {
      return { 
        score: 0, 
        aiReference: exercise.sourceText, 
        incorrectWords: [], 
        suggestions: Array(10).fill("حدث خطأ أثناء الاتصال بالخادم.") 
      };
    }
  },

  async getAssistantResponse(prompt: string, context: string): Promise<string> {
    const ai = getAI();
    try {
      // Fixed: contents simplified to string
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a translation tutor. Context: ${context}\n\nUser: ${prompt}`,
        config: { systemInstruction: "Provide expert advice in Arabic." }
      });
      return response.text?.trim() || "عذراً، لم أستطع الرد حالياً.";
    } catch (e) {
      return "المساعد منشغل حالياً.";
    }
  }
};
