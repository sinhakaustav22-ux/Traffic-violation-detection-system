import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ViolationTypeBarChart = ({ data }) => {
  const colors = {
    NO_HELMET: '#DC2626',
    RED_LIGHT_JUMP: '#D97706',
    TRIPLE_RIDING: '#7C3AED',
    NO_SEATBELT: '#2563EB'
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="violation_type" 
            tickFormatter={(tick) => tick.replace(/_/g, ' ')}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748B' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <Tooltip 
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value) => [value, 'Count']}
            labelFormatter={(label) => label.replace(/_/g, ' ')}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.violation_type] || '#94A3B8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViolationTypeBarChart;
