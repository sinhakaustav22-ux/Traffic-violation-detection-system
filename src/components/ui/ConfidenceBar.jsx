import React from 'react';

const ConfidenceBar = ({ score }) => {
  const percentage = Math.round(score * 100);
  let colorClass = 'bg-green-500';
  
  if (percentage < 70) colorClass = 'bg-red-500';
  else if (percentage < 85) colorClass = 'bg-yellow-500';

  return (
    <div className="flex items-center w-full">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-xs font-medium text-gray-700">{percentage}%</span>
    </div>
  );
};

export default ConfidenceBar;
