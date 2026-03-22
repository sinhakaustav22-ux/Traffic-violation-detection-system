import axiosClient from './axiosClient.js';

export const uploadVideo = (formData) => axiosClient.post('/uploads/video', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const uploadImage = (formData) => axiosClient.post('/uploads/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const processFile = (id) => axiosClient.post(`/uploads/${id}/process`).then(res => res.data);
export const getFiles = () => axiosClient.get('/uploads').then(res => res.data);
