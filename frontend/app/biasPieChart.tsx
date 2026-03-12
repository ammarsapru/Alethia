'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BiasPieChartProps {
  data: Record<string, number>;
  height?: number;
  isDarkMode?: boolean;
}

const BLUE_COLORS = [
  '#3b82f6', // Primary Blue
  '#60a5fa', // Blue-400
  '#1d4ed8', // Blue-700
  '#2563eb', // Blue-600
  '#1e40af', // Blue-800
];

const RED_COLORS = [
  '#dc2626', // Red-600
  '#ef4444', // Red-500
  '#991b1b', // Red-800
  '#b91c1c', // Red-700
  '#7f1d1d', // Red-900
];

const BiasPieChart: React.FC<BiasPieChartProps> = ({ data, height = 430, isDarkMode = true }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = isDarkMode ? BLUE_COLORS : RED_COLORS;
  const accentColor = isDarkMode ? '#3b82f6' : '#dc2626';
  const textColor = isDarkMode ? '#60a5fa' : '#991b1b';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={(height / 2) - 40}
          fill="#8884d8"
          dataKey="value"
          stroke={isDarkMode ? '#000' : '#fff'} 
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDarkMode ? '#000000' : '#ffffff', 
            borderColor: accentColor, 
            color: isDarkMode ? '#ffffff' : '#1e3a8a',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
            border: `1px solid ${accentColor}`
          }}
          itemStyle={{ color: accentColor }}
        />
        <Legend 
          verticalAlign="bottom"
          align="center"
          layout="horizontal"
          wrapperStyle={{ 
            color: textColor,
            fontSize: '1rem',
            paddingTop: '20px',
            fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase'
          }} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BiasPieChart;
