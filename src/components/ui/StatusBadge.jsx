import React from 'react';

const StatusBadge = ({ status }) => {
  const badgeStyles = {
    PENDING: 'bg-[#FEF9C3] text-[#854D0E]',
    REVIEWED: 'bg-[#DBEAFE] text-[#1E40AF]',
    CHALLAN_ISSUED: 'bg-[#FEE2E2] text-[#991B1B]',
    DISMISSED: 'bg-[#F1F5F9] text-[#475569]',
  };

  const style = badgeStyles[status] || 'bg-gray-100 text-gray-800';
  const label = status ? status.replace(/_/g, ' ') : 'UNKNOWN';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
