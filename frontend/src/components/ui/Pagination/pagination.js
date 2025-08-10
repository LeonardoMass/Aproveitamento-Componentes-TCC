"use client";
import React from 'react';
import styles from './pagination.module.css';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * @param {object} props
 * @param {number} props.currentPage
 * @param {number} props.totalPages
 * @param {function(number): void} props.onPageChange
 */
function Pagination({ currentPage, totalPages, onPageChange }) {


  const getPageNumbers = () => {
    const pageNumbers = [];
    const pageRange = 2;

    pageNumbers.push(1);

    if (currentPage > pageRange + 1) {
      pageNumbers.push('...');
    }

    const startPage = Math.max(2, currentPage - pageRange + 1);
    const endPage = Math.min(totalPages - 1, currentPage + pageRange - 1);

    for (let i = startPage; i <= endPage; i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }

    if (currentPage < totalPages - pageRange) {
      if (!pageNumbers.includes('...')) {
        pageNumbers.push('...');
      }
    }

    if (!pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <nav className={styles.paginationContainer} aria-label="Paginação de resultados">
      <button
        className={styles.navButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Ir para a página anterior"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
        Anterior
      </button>

      <div className={styles.pageNumbers}>
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={`page-${page}`}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              aria-label={`Ir para a página ${page}`}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              {page}
            </span>
          )
        )}
      </div>

      <button
        className={styles.navButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Ir para a próxima página"
      >
        Próximo
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </nav>
  );
}

export default Pagination;