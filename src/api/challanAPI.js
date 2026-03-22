import axiosClient from './axiosClient.js';

export const getAllChallans = () => axiosClient.get('/challans').then(res => res.data);
export const issueChallan = (violation_id) => axiosClient.post('/challans/issue', { violation_id }).then(res => res.data);
export const markAsPaid = (id, paid) => axiosClient.patch(`/challans/${id}/pay`, { paid }).then(res => res.data);
export const downloadChallanPDF = (id) => axiosClient.get(`/challans/${id}/download`, { responseType: 'blob' }).then(res => {
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `challan-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
});
