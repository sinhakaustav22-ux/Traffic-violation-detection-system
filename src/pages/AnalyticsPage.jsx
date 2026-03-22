import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, PieChart, Calendar } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import DailyTrendChart from '../components/charts/DailyTrendChart.jsx';
import ViolationTypeBarChart from '../components/charts/ViolationTypeBarChart.jsx';
import ViolationPieChart from '../components/charts/ViolationPieChart.jsx';
import HourlyHeatmap from '../components/charts/HourlyHeatmap.jsx';
import ForecastChart from '../components/charts/ForecastChart.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { getSummary, getDailyTrend, getByType, getHourlyHeatmap, getForecast } from '../api/analyticsAPI.js';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [summaryRes, trendRes, typeRes, heatmapRes, forecastRes] = await Promise.all([
          getSummary(),
          getDailyTrend(timeRange),
          getByType(timeRange),
          getHourlyHeatmap(),
          getForecast()
        ]);
        
        setSummary(summaryRes);
        setTrendData(trendRes);
        setTypeData(typeRes);
        setHeatmapData(heatmapRes);
        setForecastData(forecastRes);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);

  if (loading && !summary) {
    return (
      <PageWrapper>
        <LoadingSpinner size="lg" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Deep dive into campus traffic violation patterns.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#1E40AF] focus:outline-none focus:ring-[#1E40AF] sm:text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Violations</h3>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BarChart2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary?.total || 0}</p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Challan Conversion</h3>
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {summary?.total ? Math.round((summary.challansThisMonth / summary.total) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">Violations to challans</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Most Frequent</h3>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <PieChart size={20} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 truncate">
            {typeData.length > 0 ? typeData.reduce((prev, current) => (parseInt(prev.count) > parseInt(current.count)) ? prev : current).violation_type.replace(/_/g, ' ') : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Violation type</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Peak Time</h3>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {/* Simple logic to find peak hour from heatmap data */}
            {heatmapData.length > 0 ? (() => {
              let max = 0;
              let peakHour = 0;
              heatmapData.forEach(d => {
                if (parseInt(d.count) > max) {
                  max = parseInt(d.count);
                  peakHour = parseInt(d.hour);
                }
              });
              return `${peakHour}:00 - ${peakHour + 1}:00`;
            })() : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Highest violation frequency</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Violation Trend & Forecast (7 Days)</h3>
          {loading ? <div className="h-80 flex items-center justify-center"><LoadingSpinner /></div> : 
            forecastData ? <ForecastChart data={forecastData} /> : <p className="text-gray-500 text-center py-10">Not enough data for forecast</p>
          }
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Violations by Type</h3>
          {loading ? <div className="h-80 flex items-center justify-center"><LoadingSpinner /></div> : 
            <ViolationTypeBarChart data={typeData} />
          }
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution</h3>
          {loading ? <div className="h-80 flex items-center justify-center"><LoadingSpinner /></div> : 
            <ViolationPieChart data={typeData} />
          }
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Heatmap (All Time)</h3>
          {loading ? <div className="h-80 flex items-center justify-center"><LoadingSpinner /></div> : 
            <HourlyHeatmap data={heatmapData} />
          }
        </div>
      </div>
    </PageWrapper>
  );
};

export default AnalyticsPage;
