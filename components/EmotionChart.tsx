import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { EmotionMetric } from '../types';

interface EmotionChartProps {
  data: EmotionMetric[];
}

// Map common emotions to colors
const getEmotionColor = (emotion: string): string => {
  const map: Record<string, string> = {
    joy: '#fbbf24', // amber-400
    happiness: '#fbbf24',
    love: '#f472b6', // pink-400
    anger: '#ef4444', // red-500
    sadness: '#60a5fa', // blue-400
    fear: '#a855f7', // purple-500
    surprise: '#2dd4bf', // teal-400
    disgust: '#84cc16', // lime-500
    neutral: '#94a3b8', // slate-400
    anticipation: '#f97316', // orange-500
    trust: '#3b82f6', // blue-500
  };
  return map[emotion.toLowerCase()] || '#6366f1'; // default indigo
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) { 
    return (
      <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
        <p className="font-semibold mb-1 capitalize">{label}</p>
        <p>Intensity: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export const EmotionChart: React.FC<EmotionChartProps> = ({ data }) => {
  // Sort data by score descending for better visualization
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getEmotionColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};