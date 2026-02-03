import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  paginatedData: T[];
  startIndex: number;
  endIndex: number;
  totalItems: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const DEFAULT_PAGE_SIZE = 25;

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { pageSize = DEFAULT_PAGE_SIZE, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, validCurrentPage, pageSize]);

  const startIndex = (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, data.length);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => goToPage(validCurrentPage + 1);
  const prevPage = () => goToPage(validCurrentPage - 1);

  return {
    currentPage: validCurrentPage,
    totalPages,
    pageSize,
    paginatedData,
    startIndex,
    endIndex,
    totalItems: data.length,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: validCurrentPage < totalPages,
    canGoPrev: validCurrentPage > 1,
  };
}
