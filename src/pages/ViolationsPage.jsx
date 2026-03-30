import React, { useState } from 'react';
import toast from 'react-hot-toast';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import ViolationTable from '../components/violations/ViolationTable.jsx';
import ViolationFilters from '../components/violations/ViolationFilters.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import IssueChallanModal from '../components/modals/IssueChallanModal.jsx';
import SendAlertModal from '../components/modals/SendAlertModal.jsx';
import { useViolations } from '../hooks/useViolations.js';
import { updateViolationStatus } from '../api/violationsAPI.js';
import { issueChallan } from '../api/challanAPI.js';
import { sendAlert } from '../api/alertAPI.js';

const ViolationsPage = () => {
  const { violations, total, totalPages, loading, filters, setFilters, refetch } = useViolations();
  
  const [challanModalOpen, setChallanModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      type: 'All',
      status: 'All',
      date_from: '',
      date_to: '',
      search: ''
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const openChallanModal = (violation) => {
    setSelectedViolation(violation);
    setChallanModalOpen(true);
  };

  const openAlertModal = (violation) => {
    setSelectedViolation(violation);
    setAlertModalOpen(true);
  };

  const handleIssueChallan = async () => {
    setActionLoading(true);
    try {
      await issueChallan(selectedViolation.id);
      toast.success('Challan issued successfully');
      setChallanModalOpen(false);
      refetch();
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
        violation_id: selectedViolation.id,
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

  const handleDismiss = async (violation) => {
    if (window.confirm('Are you sure you want to dismiss this violation?')) {
      try {
        await updateViolationStatus(violation.id, 'DISMISSED');
        toast.success('Violation dismissed');
        refetch();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to dismiss violation');
      }
    }
  };

  return (
    <PageWrapper>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Violations</h1>
          <p className="text-gray-500 mt-1">Manage and review all detected traffic violations.</p>
        </div>
      </div>

      <ViolationFilters 
        filters={filters} 
        setFilters={setFilters} 
        onClear={handleClearFilters} 
      />

      <div className="mb-4 text-sm text-gray-600 font-medium">
        Showing {violations ? violations.length : 0} of {total} results
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-[#E2E8F0]">
          <LoadingSpinner size="lg" />
        </div>
      ) : !violations || violations.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-[#E2E8F0]">
          <p className="text-gray-500 text-lg">No violations found matching your criteria.</p>
          <button 
            onClick={handleClearFilters}
            className="mt-4 text-[#2563EB] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ViolationTable 
            violations={violations} 
            onIssueChallan={openChallanModal}
            onSendAlert={openAlertModal}
            onDismiss={handleDismiss}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 border border-[#E2E8F0] rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-medium">{Math.min(filters.page * filters.limit, total)}</span> of{' '}
                    <span className="font-medium">{total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    {/* Simple pagination numbers */}
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && filters.page > 3) {
                        pageNum = filters.page - 2 + i;
                        if (pageNum > totalPages) return null;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            filters.page === pageNum
                              ? 'z-10 bg-[#FF9933] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9933]'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <IssueChallanModal 
        isOpen={challanModalOpen}
        onClose={() => setChallanModalOpen(false)}
        onConfirm={handleIssueChallan}
        violation={selectedViolation}
        loading={actionLoading}
      />

      <SendAlertModal 
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onConfirm={handleSendAlert}
        violation={selectedViolation}
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

export default ViolationsPage;
