import { collection, doc, addDoc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import { Comment } from '@blockseblock/shared';
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
      where('issueId', '==', issueId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => doc.data()));
    });
  },

  getIssueComments: async (issueId: string) => {
    const q = query(
      collection(db, COMMENTS_COLLECTION).withConverter(commentConverter),
      where('issueId', '==', issueId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  }
};
