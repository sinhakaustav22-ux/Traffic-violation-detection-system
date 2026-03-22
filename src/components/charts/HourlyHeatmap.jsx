import React from 'react';

const HourlyHeatmap = ({ data }) => {
  // Initialize 7x24 grid with 0s
  const grid = Array(7).fill().map(() => Array(24).fill(0));
  let maxCount = 0;

  // Populate grid and find max
  data.forEach(item => {
    const day = parseInt(item.day_of_week, 10);
    const hour = parseInt(item.hour_of_day, 10);
    const count = parseInt(item.count, 10);
    grid[day][hour] = count;
    if (count > maxCount) maxCount = count;
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Color scale function: white -> light orange -> dark red
  const getColor = (count) => {
    if (count === 0) return '#FFFFFF';
    const intensity = Math.max(0.1, count / maxCount);
    // Interpolate between #FFEDD5 (orange-50) and #991B1B (red-800)
    // Simplified: just use opacity on a base red color
    return `rgba(220, 38, 38, ${intensity})`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex mb-1">
          <div className="w-10"></div>
          {Array(24).fill().map((_, i) => (
            <div key={i} className="flex-1 text-center text-[10px] text-gray-500">
              {i % 3 === 0 ? i : ''}
            </div>
          ))}
        </div>
        
        {days.map((day, dayIdx) => (
          <div key={day} className="flex mb-1 items-center">
            <div className="w-10 text-xs text-gray-500 font-medium text-right pr-2">{day}</div>
            {grid[dayIdx].map((count, hourIdx) => (
              <div 
                key={`${dayIdx}-${hourIdx}`} 
                className="flex-1 aspect-square rounded-sm border border-gray-100 mx-[1px]"
                style={{ backgroundColor: getColor(count) }}
                title={`${day} ${hourIdx}:00 - ${count} violations`}
              ></div>
            ))}
          </div>
        ))}
        
        <div className="flex justify-end items-center mt-4 text-xs text-gray-500">
          <span className="mr-2">Less</span>
          <div className="w-4 h-4 rounded-sm border border-gray-100 bg-white mr-1"></div>
          <div className="w-4 h-4 rounded-sm bg-red-300 mr-1"></div>
          <div className="w-4 h-4 rounded-sm bg-red-500 mr-1"></div>
          <div className="w-4 h-4 rounded-sm bg-red-700 mr-2"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyHeatmap;
