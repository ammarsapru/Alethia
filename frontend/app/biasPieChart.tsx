'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BiasPieChartProps {
  data: Record<string, number>;
  height?: number;
}

// Color palette: Neon Green, White, Dark Green, Light Green, Black
const COLORS = [
  '#22c55e', // Neon Green
  '#ffffff', // White
  '#14532d', // Dark Green
  '#86efac', // Light Green
  '#000000', // Black
];

const BiasPieChart: React.FC<BiasPieChartProps> = ({ data, height = 300 }) => {
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
          stroke="#22c55e" // Green border ensures black slices are visible
          strokeWidth={1}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#000000', borderColor: '#22c55e', color: '#22c55e' }}
          itemStyle={{ color: '#22c55e' }}
        />
        <Legend 
          wrapperStyle={{ color: '#22c55e' }} // Sets text color for legend items
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BiasPieChart;
