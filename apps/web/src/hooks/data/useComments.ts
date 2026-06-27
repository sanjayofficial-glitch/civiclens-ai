import { useState, useEffect } from 'react';
import { CommentService } from '../../services/comment.service';
import type { Comment } from '@blockseblock/shared';

export const useComments = (issueId?: string) => {
  const [comments, setComments] = useState<(Comment & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = CommentService.listenToIssueComments(issueId, (fetchedComments) => {
      setComments(fetchedComments);
      setLoading(false);
    });

    return () => unsub();
  }, [issueId]);

  return { comments, loading };
};
