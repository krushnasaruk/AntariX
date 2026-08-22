import { useState } from 'react';
import { PAGES } from '../utils/constants';

export function useMissionStore() {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  return { currentPage, setCurrentPage };
}
