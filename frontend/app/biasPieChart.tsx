'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BiasPieChartProps {
  data: Record<string, number>;
  height?: number;
  isDarkMode?: boolean;
}

// Color palette: Blue (#3b82f6), White, Dark Blue, Light Blue, Black
const COLORS = [
  '#3b82f6', // Primary Blue
  '#60a5fa', // Blue-400
  '#1d4ed8', // Blue-700
  '#2563eb', // Blue-600
  '#1e40af', // Blue-800
];

const BiasPieChart: React.FC<BiasPieChartProps> = ({ data, height = 300, isDarkMode = true }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={(height / 2) - 20}
          fill="#8884d8"
          dataKey="value"
          stroke={isDarkMode ? "#3b82f6" : "#ffffff"} 
          strokeWidth={1}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDarkMode ? '#000000' : '#ffffff', 
            borderColor: '#3b82f6', 
            color: isDarkMode ? '#3b82f6' : '#1e3a8a' 
          }}
          itemStyle={{ color: isDarkMode ? '#3b82f6' : '#1e3a8a' }}
        />
        <Legend 
          wrapperStyle={{ color: isDarkMode ? '#3b82f6' : '#1e3a8a' }} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BiasPieChart;
