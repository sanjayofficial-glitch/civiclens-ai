import { useState, useEffect } from 'react';
import { VoteService } from '../../services/vote.service';
import { useAuth } from '../useAuth';

import type { VoteType } from '@civiclens/shared';

export const useUserVote = (issueId?: string) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<VoteType | null>(null);

  useEffect(() => {
    if (!issueId || !user) return;

    let isMounted = true;

    VoteService.getUserVoteForIssue(issueId, user.uid).then((vote) => {
      if (isMounted) {
        setUserVote(vote ? vote.type : null);
      }
    });

    return () => { isMounted = false; };
  }, [issueId, user]);

  return { userVote, setUserVote };
};
