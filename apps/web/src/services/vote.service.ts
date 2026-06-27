import { collection, doc, query, where, onSnapshot, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, runTransaction } from '../lib/firebase/firestore.service';
import { Vote, VoteType } from '@blockseblock/shared';
import { voteConverter } from './converters';

const VOTES_COLLECTION = 'votes';
const ISSUES_COLLECTION = 'issues';

export const VoteService = {
  castVote: async (issueId: string, userId: string, type: VoteType) => {
    const voteId = `${issueId}_${userId}`;
    const voteRef = doc(db, VOTES_COLLECTION, voteId).withConverter(voteConverter);
    const issueRef = doc(db, ISSUES_COLLECTION, issueId);

    await runTransaction(db, async (transaction) => {
      const voteSnap = await transaction.get(voteRef);
      const issueSnap = await transaction.get(issueRef);
      
      if (!issueSnap.exists()) throw new Error("Issue does not exist");
      
      const issueData = issueSnap.data();
      let upvotes = issueData.verification?.upvotes || 0;
      let downvotes = issueData.verification?.downvotes || 0;
      let verifiedBy = issueData.verification?.verifiedBy || [];
      
      if (voteSnap.exists()) {
        const existingVote = voteSnap.data();
        if (existingVote.type === type) {
          // Unvote (remove vote)
          transaction.delete(voteRef);
          if (type === 'upvote') {
            upvotes--;
            verifiedBy = verifiedBy.filter((id: string) => id !== userId);
          } else {
            downvotes--;
          }
        } else {
          // Switch vote
          transaction.set(voteRef, {
            issueId,
            userId,
            type,
            createdAt: existingVote.createdAt
          } as Vote & { id: string });
          
          if (type === 'upvote') {
            upvotes++;
            downvotes--;
            verifiedBy.push(userId);
          } else {
            upvotes--;
            downvotes++;
            verifiedBy = verifiedBy.filter((id: string) => id !== userId);
          }
        }
      } else {
        // New vote
        transaction.set(voteRef, {
          issueId,
          userId,
          type,
          createdAt: new Date().toISOString()
        } as Vote & { id: string });
        
        if (type === 'upvote') {
          upvotes++;
          verifiedBy.push(userId);
        } else {
          downvotes++;
        }
      }
      
      transaction.update(issueRef, {
        'verification.upvotes': upvotes,
        'verification.downvotes': downvotes,
        'verification.verifiedBy': verifiedBy
      });
    });
  },

  getUserVoteForIssue: async (issueId: string, userId: string) => {
    const voteId = `${issueId}_${userId}`;
    const snap = await getDoc(doc(db, VOTES_COLLECTION, voteId).withConverter(voteConverter));
    return snap.exists() ? snap.data() : null;
  }
};
