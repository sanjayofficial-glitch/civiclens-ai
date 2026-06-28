import type { Comment } from '@civiclens/shared';

import { useState, useEffect, useCallback } from 'react';

import { CommentService } from '../../services/comment.service';

export const useComments = (issueId?: string) => {
  const [comments, setComments] = useState<(Comment & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!issueId) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const unsub = CommentService.listenToIssueComments(
      issueId,
      (fetchedComments) => {
        setComments(fetchedComments);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => {
      unsub();
    };
  }, [issueId, retryKey]);

  const refresh = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return { comments, loading, error, refresh };
};
