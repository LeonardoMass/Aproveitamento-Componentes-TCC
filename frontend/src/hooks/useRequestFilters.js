import { useState, useCallback, useEffect } from "react";

export const useRequestFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    search: "",
    selectedStep: null,
    selectedStatus: null,
    selectedNotice: null,
    selectedCourse: null,
    selectedDiscipline: null,
    selectedOutcome: null,
    selectedType: null,
    itemsPerPage: 10,
    ...initialFilters
  });

  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  useEffect(() => {
    const savedFilters = localStorage.getItem('requestFilters');
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('requestFilters', JSON.stringify(filters));
  }, [filters]);

  return {
    filters,
    updateFilter
  };
};