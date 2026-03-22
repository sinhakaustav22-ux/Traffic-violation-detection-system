import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import ViolationDetailCard from '../components/violations/ViolationDetailCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import IssueChallanModal from '../components/modals/IssueChallanModal.jsx';
import SendAlertModal from '../components/modals/SendAlertModal.jsx';
import { getViolationById, updateViolationStatus } from '../api/violationsAPI.js';
import { issueChallan } from '../api/challanAPI.js';
import { sendAlert } from '../api/alertAPI.js';

const ViolationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [violation, setViolation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [challanModalOpen, setChallanModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchViolation = async () => {
    try {
      const data = await getViolationById(id);
      setViolation(data);
    } catch (err) {
      toast.error('Failed to load violation details');
      navigate('/violations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolation();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateViolationStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchViolation();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleIssueChallan = async () => {
    setActionLoading(true);
    try {
      await issueChallan(id);
      toast.success('Challan issued successfully');
      setChallanModalOpen(false);
      fetchViolation();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue challan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendAlert = async (phone, channels) => {
    setActionLoading(true);
    try {
      await sendAlert({
        violation_id: id,
        phone_number: phone,
        channels
      });
      toast.success('Alert sent successfully');
      setAlertModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (window.confirm('Are you sure you want to dismiss this violation?')) {
      handleStatusChange('DISMISSED');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSpinner size="lg" />
      </PageWrapper>
    );
  }

  if (!violation) return null;

  return (
    <PageWrapper>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/violations')}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Violations
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Violation Details</h1>
        <p className="text-gray-500 mt-1">ID: #{violation.id}</p>
      </div>

      <ViolationDetailCard 
        violation={violation}
        onStatusChange={handleStatusChange}
        onIssueChallan={() => setChallanModalOpen(true)}
        onSendAlert={() => setAlertModalOpen(true)}
        onDismiss={handleDismiss}
      />

      <IssueChallanModal 
        isOpen={challanModalOpen}
        onClose={() => setChallanModalOpen(false)}
        onConfirm={handleIssueChallan}
        violation={violation}
        loading={actionLoading}
      />

      <SendAlertModal 
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onConfirm={handleSendAlert}
        violation={violation}
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

export default ViolationDetailPage;
