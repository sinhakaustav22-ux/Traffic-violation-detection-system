import axiosClient from './axiosClient.js';

export const getSummary = () => axiosClient.get('/analytics/summary').then(res => res.data);
export const getDailyTrend = () => axiosClient.get('/analytics/trend').then(res => res.data);
export const getByType = () => axiosClient.get('/analytics/type').then(res => res.data);
export const getHourlyHeatmap = () => axiosClient.get('/analytics/heatmap').then(res => res.data);
export const getForecast = () => axiosClient.get('/analytics/forecast').then(res => res.data);
