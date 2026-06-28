import { collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import type { Comment } from '@blockseblock/shared';
import { commentConverter } from './converters';

const COMMENTS_COLLECTION = 'comments';

export const CommentService = {
  create: async (data: Omit<Comment, 'id' | 'createdAt'>) => {
    const colRef = collection(db, COMMENTS_COLLECTION).withConverter(commentConverter);
    const now = new Date().toISOString();
    return addDoc(colRef, {
      ...data,
      createdAt: now,
    } as Comment & { id: string });
  },

  listenToIssueComments: (issueId: string, callback: (comments: (Comment & { id: string })[]) => void) => {
    const q = query(
      collection(db, COMMENTS_COLLECTION).withConverter(commentConverter),
      where('issueId', '==', issueId)
    );
    
    return onSnapshot(q, (snap) => {
      const comments = snap.docs.map(doc => doc.data());
      comments.sort((a, b) => new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime());
      callback(comments);
    });
  },

  getIssueComments: async (issueId: string) => {
    const q = query(
      collection(db, COMMENTS_COLLECTION).withConverter(commentConverter),
      where('issueId', '==', issueId)
    );
    const snap = await getDocs(q);
    const comments = snap.docs.map(doc => doc.data());
    comments.sort((a, b) => new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime());
    return comments;
  }
};
