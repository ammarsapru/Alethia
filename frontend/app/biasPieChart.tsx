import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TooltipProps } from "recharts";

const COLORS: Record<string, string> = {
  "left": "#3B82F6",
  "left-center": "#14B8A6",
  "center": "#10B981",
  "right-center": "#8B5CF6",
  "right": "#EF4444",
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white p-2 rounded shadow text-sm">
        <p><strong>{name}</strong>: {value?.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};



export default function BiasPieChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name.toLowerCase()] || "#E5E7EB"} // default gray
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
