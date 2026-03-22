import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ForecastChart = ({ data }) => {
  // data contains historical and forecast arrays
  const { historical, forecast } = data;
  
  // Combine data for chart
  const chartData = [
    ...historical.map(h => ({
      date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      actual: parseInt(h.count, 10),
      predicted: null,
      lower: null,
      upper: null
    })),
    ...forecast.map(f => ({
      date: new Date(f.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      actual: null,
      predicted: f.predicted_count,
      lower: f.lower_bound,
      upper: f.upper_bound,
      range: [f.lower_bound, f.upper_bound]
    }))
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748B' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="top" height={36} />
          
          <Area 
            type="monotone" 
            dataKey="range" 
            fill="#DBEAFE" 
            stroke="none" 
            name="Confidence Interval"
            activeDot={false}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#1E40AF" 
            strokeWidth={3} 
            name="Actual Violations"
            dot={{ r: 4, fill: '#1E40AF', strokeWidth: 2, stroke: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#FF9933" 
            strokeWidth={3} 
            strokeDasharray="5 5" 
            name="Predicted Violations"
            dot={{ r: 4, fill: '#FF9933', strokeWidth: 2, stroke: '#fff' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
