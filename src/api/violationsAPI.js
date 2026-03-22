import axiosClient from './axiosClient.js';

export const getViolations = (params) => axiosClient.get('/violations', { params }).then(res => res.data);
export const getViolationById = (id) => axiosClient.get(`/violations/${id}`).then(res => res.data);
export const updateViolationStatus = (id, status) => axiosClient.patch(`/violations/${id}/status`, { status }).then(res => res.data);
