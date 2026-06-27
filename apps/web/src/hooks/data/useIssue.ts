import { useState, useEffect } from 'react';
import { IssueService } from '../../services/issue.service';
import type { Issue } from '@blockseblock/shared';

export const useIssue = (id?: string) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const unsub = IssueService.listenToIssue(
      id,
      (fetchedIssue) => {
        setIssue(fetchedIssue);
        setLoading(false);
      },
      (err) => {
        console.error('useIssue: listener error', err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [id]);

  return { issue, loading, error };
};
