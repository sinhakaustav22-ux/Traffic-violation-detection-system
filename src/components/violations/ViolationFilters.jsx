import React from 'react';

const ViolationFilters = ({ filters, setFilters, onClear }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
        <input
          type="date"
          name="date_from"
          value={filters.date_from}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9933] focus:ring-[#FF9933] sm:text-sm"
        />
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
        <input
          type="date"
          name="date_to"
          value={filters.date_to}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9933] focus:ring-[#FF9933] sm:text-sm"
        />
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9933] focus:ring-[#FF9933] sm:text-sm"
        >
          <option value="All">All Types</option>
          <option value="NO_HELMET">No Helmet</option>
          <option value="RED_LIGHT_JUMP">Red Light Jump</option>
          <option value="TRIPLE_RIDING">Triple Riding</option>
          <option value="NO_SEATBELT">No Seatbelt</option>
        </select>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9933] focus:ring-[#FF9933] sm:text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="CHALLAN_ISSUED">Challan Issued</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Number</label>
        <input
          type="text"
          name="search"
          placeholder="Search..."
          value={filters.search}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9933] focus:ring-[#FF9933] sm:text-sm"
        />
      </div>
      
      <button
        onClick={onClear}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ViolationFilters;
