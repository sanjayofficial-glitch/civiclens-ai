import type { Comment } from '@civiclens/shared';

import { useState, useEffect, useCallback } from 'react';

import { CommentService } from '../../services/comment.service';
import { UserService } from '../../services/user.service';

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
        const uniqueUserIds = Array.from(new Set(fetchedComments.map((c) => c.userId)));
        
        Promise.all(uniqueUserIds.map((uid) => UserService.getProfile(uid)))
          .then((profiles) => {
            const profileMap = new Map<string, any>();
            profiles.forEach((p) => {
              if (p) profileMap.set(p.uid, p);
            });

            const enriched = fetchedComments.map((c) => ({
              ...c,
              userName: profileMap.get(c.userId)?.displayName || c.userName,
              userPhoto: profileMap.get(c.userId)?.photoURL || c.userPhoto,
            }));

            setComments(enriched);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Failed to enrich comments with user profiles:', err);
            setComments(fetchedComments);
            setLoading(false);
          });
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
