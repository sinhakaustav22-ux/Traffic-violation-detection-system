import { useState, useEffect, useCallback } from 'react';
import { getViolations } from '../api/violationsAPI.js';
import { useSocket } from './useSocket.js';

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
      setViolations(data.violations || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
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

  // Listen for real-time new violations
  useSocket('new_violation', (newViolation) => {
    // Only add to the list if we are on the first page and filters match
    // For simplicity, we'll just refetch if we're on page 1, or just add it to the top
    if (filters.page === 1) {
      setViolations(prev => {
        const current = prev || [];
        // Check if it already exists to prevent duplicates
        if (current.some(v => v.id === newViolation.id)) return current;
        
        // Add to top and remove last item if we exceed limit
        const updated = [newViolation, ...current];
        if (updated.length > filters.limit) {
          updated.pop();
        }
        return updated;
      });
      setTotal(prev => prev + 1);
    }
  });

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
