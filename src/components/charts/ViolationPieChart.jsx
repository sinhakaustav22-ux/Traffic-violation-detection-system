import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ViolationPieChart = ({ data = [] }) => {
  const colors = {
    NO_HELMET: '#DC2626', // red
    RED_LIGHT_JUMP: '#D97706', // orange
    TRIPLE_RIDING: '#7C3AED', // purple
    NO_SEATBELT: '#2563EB' // blue
  };

  const formattedData = (data || []).map(item => ({
    name: item.violation_type.replace(/_/g, ' '),
    value: parseInt(item.count, 10),
    type: item.violation_type
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.type] || '#94A3B8'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-gray-600 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViolationPieChart;
