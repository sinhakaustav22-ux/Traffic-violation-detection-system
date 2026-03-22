import React from 'react';

const StatCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <span
            className={`ml-2 text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {changeType === 'positive' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
