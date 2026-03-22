import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Phone, X } from 'lucide-react';
import ViolationTypeBadge from '../ui/ViolationTypeBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import ConfidenceBar from '../ui/ConfidenceBar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ViolationTable = ({ violations, onIssueChallan, onSendAlert, onDismiss }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {violations.map((v, idx) => (
            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(v.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ViolationTypeBadge type={v.violation_type} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {v.vehicle_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {v.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap w-32">
                <ConfidenceBar score={v.confidence_score} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={v.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => navigate(`/violations/${v.id}`)}
                  className="text-gray-400 hover:text-[#2563EB] transition-colors"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                
                {user?.role !== 'viewer' && (
                  <>
                    <button
                      onClick={() => onIssueChallan(v)}
                      disabled={v.status === 'CHALLAN_ISSUED' || v.status === 'DISMISSED'}
                      className={`transition-colors ${
                        v.status === 'CHALLAN_ISSUED' || v.status === 'DISMISSED'
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-[#138808]'
                      }`}
                      title="Issue Challan"
                    >
                      <FileText size={18} />
                    </button>
                    
                    <button
                      onClick={() => onSendAlert(v)}
                      className="text-gray-400 hover:text-[#FF9933] transition-colors"
                      title="Send Alert"
                    >
                      <Phone size={18} />
                    </button>
                    
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => onDismiss(v)}
                        disabled={v.status === 'DISMISSED'}
                        className={`transition-colors ${
                          v.status === 'DISMISSED'
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-[#DC2626]'
                        }`}
                        title="Dismiss"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViolationTable;
