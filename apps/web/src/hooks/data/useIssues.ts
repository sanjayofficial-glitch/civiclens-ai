import { useState, useEffect, useCallback, useRef } from 'react';
import { IssueService, type IssueFilters } from '../../services/issue.service';
import type { Issue } from '@blockseblock/shared';
import { DocumentSnapshot } from 'firebase/firestore';

export const useIssues = (filters?: IssueFilters, pageSize = 10, refreshKey = 0) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stable string key to detect actual filter changes without triggering on every render
  const filtersKey = filters ? JSON.stringify(filters) : 'all';

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsub = IssueService.listenToIssues(
      filters,
      pageSize,
      (fetchedIssues) => {
        setIssues(fetchedIssues);
        setLoading(false);
      },
      (err) => {
        console.error('useIssues: listener error', err);
        // If the indexed query fails (e.g. index not deployed), fall back to a broader query
        // and filter client-side so the UI never shows "failed to load"
        if (filters?.reporterId && err.message?.includes('index')) {
          IssueService.listenToIssues(
            {},
            100,
            (allIssues) => {
              setIssues(allIssues.filter((i) => i.reporterId === filters.reporterId));
              setLoading(false);
              setError(null);
            },
            () => {
              setError(err);
              setLoading(false);
            },
          );
        } else {
          setError(err);
          setLoading(false);
        }
      },
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, pageSize, refreshKey]);

  return { issues, loading, error };
};

// Pagination-friendly hook (not realtime, but manual fetch)
export const useIssuesPaginated = (filters?: IssueFilters, pageSize = 10) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>(undefined);

  const fetchIssues = useCallback(async (isNextPage = false) => {
    try {
      setLoading(true);
      const res = await IssueService.getIssues(filters, pageSize, isNextPage ? lastDoc : undefined);
      
      setIssues(prev => isNextPage ? [...prev, ...res.issues] : res.issues);
      setLastDoc(res.lastDoc);
      setHasMore(res.issues.length === pageSize);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), pageSize, lastDoc]);

  useEffect(() => {
    fetchIssues();
  }, [JSON.stringify(filters), pageSize]);

  return { issues, loading, hasMore, loadMore: () => fetchIssues(true) };
};
