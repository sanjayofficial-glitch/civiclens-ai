import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import { Issue } from '@blockseblock/shared/types';

const ISSUES_COLLECTION = 'issues';

export const IssueService = {
  create: async (data: Omit<Issue, 'id'>) => {
    return addDoc(collection(db, ISSUES_COLLECTION), data);
  },

  getById: async (id: string) => {
    const docRef = doc(db, ISSUES_COLLECTION, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } as Issue : null;
  },

  update: async (id: string, data: Partial<Issue>) => {
    const docRef = doc(db, ISSUES_COLLECTION, id);
    return updateDoc(docRef, data);
  },

  // Pagination Example
  getRecent: async (pageSize = 10, lastDoc?: any) => {
    let q = query(collection(db, ISSUES_COLLECTION), orderBy('createdAt', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    const snap = await getDocs(q);
    return {
      issues: snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Issue)),
      lastDoc: snap.docs[snap.docs.length - 1]
    };
  },

  // Realtime Listener Example
  listenToIssue: (id: string, callback: (issue: Issue | null) => void) => {
    return onSnapshot(doc(db, ISSUES_COLLECTION, id), (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } as Issue : null);
    });
  }
};
