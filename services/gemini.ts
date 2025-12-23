import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, VideoAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    primaryEmotion: {
      type: Type.STRING,
      description: "The single most dominant emotion detected in the text.",
    },
    sentimentScore: {
      type: Type.NUMBER,
      description: "A score from -1.0 (very negative) to 1.0 (very positive).",
    },
    intensity: {
      type: Type.NUMBER,
      description: "How intense the emotion is, from 0 to 100.",
    },
    emotions: {
      type: Type.ARRAY,
      description: "A detailed breakdown of specific emotions detected.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "Percentage score 0-100" },
        },
        required: ["name", "score"],
      },
    },
    explanation: {
      type: Type.STRING,
      description: "A brief natural language explanation of why these emotions were detected.",
    },
    actionableInsight: {
      type: Type.STRING,
      description: "A short suggestion on how to respond or react to this sentiment (e.g., for a brand manager).",
    },
  },
  required: ["primaryEmotion", "sentimentScore", "intensity", "emotions", "explanation", "actionableInsight"],
};

const videoResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedState: {
      type: Type.STRING,
      enum: ['happy', 'joy', 'sad', 'depression', 'anger', 'sorrow', 'excited', 'overthinking', 'hungry', 'neutral'],
      description: "The detected emotional or mental state of the person.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score from 0 to 100.",
    },
    observation: {
      type: Type.STRING,
      description: "Brief observation of facial cues (e.g., 'Furrowed brows indicate deep thought').",
    },
    mentalHealthIndicator: {
      type: Type.STRING,
      description: "A gentle assessment of the mental vibe (e.g., 'Seems high energy', 'Appears distressed').",
    },
  },
  required: ["detectedState", "confidence", "observation", "mentalHealthIndicator"],
};

export const analyzeSentiment = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following social media text for emotions and sentiment: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: textResponseSchema,
        systemInstruction: "You are an expert social media sentiment analyst. Analyze the input text to identify emotional undertones, sentiment polarity, and specific emotions (Joy, Anger, Sadness, Fear, Surprise, Disgust, Trust, Anticipation). Provide a precise JSON response."
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response text from Gemini.");
    }

    const result = JSON.parse(jsonText) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Gemini Text Analysis Error:", error);
    throw error;
  }
};

export const analyzeImageEmotion = async (base64Image: string): Promise<VideoAnalysisResult> => {
  try {
    // base64Image comes in as "data:image/jpeg;base64,..."
    // We need to strip the prefix
    const data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: data
            }
          },
          {
            text: "Analyze the facial expression and body language in this image. Determine the person's current state from this specific list: happy, joy, sad, depression, anger, sorrow, excited, overthinking, hungry. If none fit perfectly, choose the closest or 'neutral'."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: videoResponseSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini Vision");
    
    return JSON.parse(jsonText) as VideoAnalysisResult;
  } catch (error) {
    console.error("Gemini Video Analysis Error:", error);
    throw error;
  }
};