import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, FileText, Activity } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import DailyTrendChart from '../components/charts/DailyTrendChart.jsx';
import ViolationPieChart from '../components/charts/ViolationPieChart.jsx';
import ViolationTypeBadge from '../components/ui/ViolationTypeBadge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ConfidenceBar from '../components/ui/ConfidenceBar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getSummary, getDailyTrend, getByType } from '../api/analyticsAPI.js';
import { getViolations } from '../api/violationsAPI.js';
import { formatViolationType } from '../utils/formatters.js';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [recentViolations, setRecentViolations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, trendRes, typeRes, violationsRes] = await Promise.all([
          getSummary(),
          getDailyTrend(),
          getByType(),
          getViolations({ limit: 10 })
        ]);
        
        setSummary(summaryRes);
        setTrendData(trendRes);
        setTypeData(typeRes);
        setRecentViolations(violationsRes.violations);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMostCommonType = () => {
    if (!typeData.length) return { type: 'N/A', count: 0 };
    return typeData.reduce((prev, current) => 
      (parseInt(prev.count) > parseInt(current.count)) ? prev : current
    );
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSpinner size="lg" />
      </PageWrapper>
    );
  }

  const mostCommon = getMostCommonType();

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with campus traffic today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Today's Violations" 
          value={summary?.today || 0} 
          icon={<AlertTriangle className="text-[#FF9933]" size={24} />}
          change="12%"
          changeType="positive"
        />
        <StatCard 
          title="Pending Review" 
          value={summary?.pending || 0} 
          icon={<Clock className="text-yellow-500" size={24} />}
          change="5%"
          changeType="negative"
        />
        <StatCard 
          title="Challans This Month" 
          value={summary?.challansThisMonth || 0} 
          icon={<FileText className="text-red-500" size={24} />}
          change="8%"
          changeType="positive"
        />
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Most Common Type</h3>
            <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
              <Activity className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="flex items-baseline">
            {mostCommon.type !== 'N/A' ? (
              <ViolationTypeBadge type={mostCommon.violation_type} />
            ) : (
              <span className="text-lg font-medium text-gray-900">N/A</span>
            )}
            <span className="ml-2 text-sm text-gray-500">{mostCommon.count} total</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Trend (Last 30 Days)</h3>
          <DailyTrendChart data={trendData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Violations by Type</h3>
          <ViolationPieChart data={typeData} />
        </div>
      </div>

      {/* Recent Violations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Violations</h3>
          <button 
            onClick={() => navigate('/violations')}
            className="text-sm font-medium text-[#2563EB] hover:text-blue-800"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentViolations.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/violations/${v.id}`)}
                      className="text-[#2563EB] hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
