import React from 'react';

const ViolationTypeBadge = ({ type }) => {
  const badgeStyles = {
    NO_HELMET: 'bg-[#FEE2E2] text-[#991B1B]',
    RED_LIGHT_JUMP: 'bg-[#FEF3C7] text-[#92400E]',
    TRIPLE_RIDING: 'bg-[#EDE9FE] text-[#5B21B6]',
    NO_SEATBELT: 'bg-[#DBEAFE] text-[#1E40AF]',
  };

  const style = badgeStyles[type] || 'bg-gray-100 text-gray-800';
  const label = type ? type.replace(/_/g, ' ') : 'UNKNOWN';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
};

export default ViolationTypeBadge;
