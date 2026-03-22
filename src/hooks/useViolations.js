import { useState, useEffect, useCallback } from 'react';
import { getViolations } from '../api/violationsAPI.js';

export const useViolations = (initialFilters = {}) => {
  const [violations, setViolations] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    type: 'All',
    status: 'All',
    date_from: '',
    date_to: '',
    search: '',
    ...initialFilters
  });

  const fetchViolations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getViolations(filters);
      setViolations(data.violations);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch violations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return {
    violations,
    total,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchViolations
  };
};
