import React from 'react';
import ViolationTypeBadge from '../ui/ViolationTypeBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import ConfidenceBar from '../ui/ConfidenceBar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ViolationDetailCard = ({ violation, onStatusChange, onIssueChallan, onSendAlert, onDismiss }) => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left: Image */}
        <div className="bg-gray-100 flex items-center justify-center min-h-[400px] border-r border-[#E2E8F0]">
          {violation.snapshot_path ? (
            <img 
              src={`/${violation.snapshot_path}`} 
              alt="Violation Snapshot" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No snapshot available</p>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <ViolationTypeBadge type={violation.violation_type} />
              <h2 className="text-2xl font-bold text-gray-900 mt-2">{violation.vehicle_number}</h2>
            </div>
            <StatusBadge status={violation.status} />
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 flex-1">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date & Time</p>
              <p className="font-medium text-gray-900">{new Date(violation.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-medium text-gray-900">{violation.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Vehicle Type</p>
              <p className="font-medium text-gray-900">{violation.vehicle_type?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Fine Amount</p>
              <p className="font-medium text-gray-900">₹{violation.fine_amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Source</p>
              <p className="font-medium text-gray-900">{violation.source_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Confidence Score</p>
              <ConfidenceBar score={violation.confidence_score} />
            </div>
          </div>

          {!isViewer && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-3">
                <select
                  value={violation.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-[#FF9933] focus:ring-[#FF9933] sm:text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="CHALLAN_ISSUED">Challan Issued</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>

                <button
                  onClick={onIssueChallan}
                  disabled={violation.status === 'CHALLAN_ISSUED' || violation.status === 'DISMISSED'}
                  className="px-4 py-2 bg-[#138808] text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Issue Challan
                </button>

                <button
                  onClick={onSendAlert}
                  className="px-4 py-2 bg-[#FF9933] text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Send Alert
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={onDismiss}
                    disabled={violation.status === 'DISMISSED'}
                    className="px-4 py-2 bg-white border border-gray-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViolationDetailCard;
