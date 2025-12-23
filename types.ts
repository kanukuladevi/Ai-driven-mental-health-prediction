export interface EmotionMetric {
  name: string;
  score: number; // 0 to 100
  color?: string;
}

export interface AnalysisResult {
  primaryEmotion: string;
  sentimentScore: number; // -1 (Negative) to 1 (Positive)
  intensity: number; // 0 to 100
  emotions: EmotionMetric[];
  explanation: string;
  actionableInsight: string;
}

export interface VideoAnalysisResult {
  detectedState: 'happy' | 'joy' | 'sad' | 'depression' | 'anger' | 'sorrow' | 'excited' | 'overthinking' | 'hungry' | 'neutral';
  confidence: number;
  observation: string;
  mentalHealthIndicator: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export const SAMPLE_TEXTS = [
  {
    label: "Product Launch Excitement",
    text: "I literally cannot wait for the new update! The features look absolutely mind-blowing 🤯. It's been so long since I've been this hyped about a release. Take my money already!"
  },
  {
    label: "Customer Service Frustration",
    text: "I've been on hold for 45 minutes. This is the third time calling this week. Your support team keeps passing me around and nobody solves the billing issue. Completely unacceptable service."
  },
  {
    label: "Mixed Movie Review",
    text: "Just watched the new blockbuster. The visuals were stunning and the soundtrack was great, but the plot felt really rushed and the dialogue was cheesy. Not sure how I feel about it overall."
  }
];

export type NavTab = 'text' | 'video' | 'games';