import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, onSnapshot, getDocs, QueryConstraint, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import type { Issue, IssueStatus, IssueCategory, IssueSeverity } from '@blockseblock/shared';
import { issueConverter } from './converters';

const ISSUES_COLLECTION = 'issues';

export interface IssueFilters {
  status?: IssueStatus;
  category?: IssueCategory;
  severity?: IssueSeverity;
  reporterId?: string;
}

export const IssueService = {
  create: async (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const colRef = collection(db, ISSUES_COLLECTION).withConverter(issueConverter);
    const now = new Date().toISOString();
    return addDoc(colRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Issue);
  },

  getById: async (id: string) => {
    const docRef = doc(db, ISSUES_COLLECTION, id).withConverter(issueConverter);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },

  update: async (id: string, data: Partial<Issue>) => {
    const docRef = doc(db, ISSUES_COLLECTION, id);
    return updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  delete: async (id: string) => {
    const docRef = doc(db, ISSUES_COLLECTION, id);
    return deleteDoc(docRef);
  },

  getIssues: async (filters: IssueFilters = {}, pageSize = 10, lastDoc?: DocumentSnapshot) => {
    const constraints: QueryConstraint[] = [];
    
    if (filters.status) constraints.push(where('status', '==', filters.status));
    if (filters.category) constraints.push(where('category', '==', filters.category));
    if (filters.severity) constraints.push(where('severity', '==', filters.severity));
    if (filters.reporterId) constraints.push(where('reporterId', '==', filters.reporterId));
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(pageSize));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, ISSUES_COLLECTION).withConverter(issueConverter), ...constraints);
    const snap = await getDocs(q);
    
    return {
      issues: snap.docs.map(doc => doc.data()),
      lastDoc: snap.docs[snap.docs.length - 1]
    };
  },

  listenToIssue: (
    id: string,
    callback: (issue: Issue | null) => void,
    onError?: (error: Error) => void,
  ) => {
    return onSnapshot(
      doc(db, ISSUES_COLLECTION, id).withConverter(issueConverter),
      (snap) => {
        callback(snap.exists() ? snap.data() : null);
      },
      (err) => {
        console.error('listenToIssue error:', err);
        onError?.(err);
      },
    );
  },

  listenToIssues: (
    filters: IssueFilters = {},
    pageSize = 10,
    callback: (issues: Issue[]) => void,
    onError?: (error: Error) => void,
  ) => {
    const constraints: QueryConstraint[] = [];
    
    if (filters.status) constraints.push(where('status', '==', filters.status));
    if (filters.category) constraints.push(where('category', '==', filters.category));
    if (filters.severity) constraints.push(where('severity', '==', filters.severity));
    if (filters.reporterId) constraints.push(where('reporterId', '==', filters.reporterId));
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(pageSize));

    const q = query(collection(db, ISSUES_COLLECTION).withConverter(issueConverter), ...constraints);
    
    return onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map(doc => doc.data()));
      },
      (err) => {
        console.error('listenToIssues error:', err);
        onError?.(err);
      },
    );
  }
};
