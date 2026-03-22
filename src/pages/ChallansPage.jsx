import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Download, CheckCircle, Clock, FileText } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { getAllChallans, downloadChallanPDF, markAsPaid } from '../api/challanAPI.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const ChallansPage = () => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const data = await getAllChallans();
      setChallans(data);
    } catch (err) {
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const handleDownload = async (id) => {
    setActionLoading(`download-${id}`);
    try {
      await downloadChallanPDF(id);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Are you sure you want to mark this challan as paid?')) return;
    
    setActionLoading(`pay-${id}`);
    try {
      await markAsPaid(id);
      toast.success('Challan marked as paid');
      fetchChallans();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'PAID') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" /> Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock size={12} className="mr-1" /> Pending
      </span>
    );
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Challans</h1>
        <p className="text-gray-500 mt-1">Manage issued challans and track payments.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : challans.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <FileText size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No challans issued yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {challan.challan_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challan.vehicle_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(challan.issued_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(challan.fine_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(challan.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleDownload(challan.id)}
                          disabled={actionLoading === `download-${challan.id}`}
                          className="text-[#1E40AF] hover:text-blue-800 flex items-center disabled:opacity-50"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        {challan.payment_status === 'PENDING' && (
                          <button
                            onClick={() => handleMarkPaid(challan.id)}
                            disabled={actionLoading === `pay-${challan.id}`}
                            className="text-[#138808] hover:text-green-800 flex items-center disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ChallansPage;
