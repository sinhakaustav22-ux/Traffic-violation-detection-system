import React, { useState, useEffect } from 'react';
import { MessageSquare, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { getAlerts } from '../api/alertAPI.js';
import { formatDate } from '../utils/formatters.js';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getChannelIcon = (channel) => {
    if (channel === 'SMS') return <MessageSquare size={16} className="text-blue-500 mr-1" />;
    if (channel === 'WHATSAPP') return <Smartphone size={16} className="text-green-500 mr-1" />;
    return null;
  };

  const getStatusIcon = (status) => {
    if (status === 'SENT' || status === 'DELIVERED') {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    if (status === 'FAILED') {
      return <XCircle size={16} className="text-red-500" />;
    }
    return null;
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Communication Logs</h1>
        <p className="text-gray-500 mt-1">History of SMS and WhatsApp alerts sent to violators.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <MessageSquare size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No alerts have been sent yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(alert.sent_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getChannelIcon(alert.channel)}
                        <span>{alert.channel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.vehicle_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(alert.status)}
                        <span className={`ml-1 text-sm ${
                          alert.status === 'FAILED' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {alert.status}
                        </span>
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

export default AlertsPage;
