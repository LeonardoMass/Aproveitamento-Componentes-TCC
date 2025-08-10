import { useState, useMemo, useEffect } from 'react';

/**
 * @param {Array} data
 * @param {number} [itemsPerPage=10]
 * @returns {{
 *   currentPage: number,
 *   setCurrentPage: function(number): void,
 *   paginatedData: Array,
 *   totalPages: number
 * }}
 */
export const usePagination = (data, itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => {
        if (!data || data.length === 0 || itemsPerPage === 0) {
            return 1;
        }
        return Math.max(1, Math.ceil(data.length / itemsPerPage));
    }, [data, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [data, itemsPerPage]);

    const paginatedData = useMemo(() => {
        if (!data) return [];
        if (itemsPerPage === 0) return data;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    return {
        currentPage,
        setCurrentPage,
        paginatedData,
        totalPages,
    };
};