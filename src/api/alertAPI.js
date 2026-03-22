import axiosClient from './axiosClient.js';

export const sendAlert = (data) => axiosClient.post('/alerts/send', data).then(res => res.data);
export const getAlerts = (params) => axiosClient.get('/alerts', { params }).then(res => res.data);
