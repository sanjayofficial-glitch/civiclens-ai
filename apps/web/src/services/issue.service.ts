import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, onSnapshot, getDocs, QueryConstraint, DocumentSnapshot, increment } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import type { Issue, IssueStatus, IssueCategory, IssueSeverity } from '@civiclens/shared';
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
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Issue);

    // Optimistically increment the reporter's issuesReported counter
    // so the profile/home stats update immediately (Cloud Function also does this)
    if (data.reporterId) {
      try {
        await updateDoc(doc(db, 'users', data.reporterId), {
          issuesReported: increment(1),
        });
      } catch {
        // Non-fatal — Cloud Function will handle it on server
      }
    }

    return docRef;
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
        callback(snap.docs.map((doc) => doc.data()));
      },
      (err) => {
        console.error('listenToIssues error:', err);

        // Index not yet built — fall back to a simple equality filter without orderBy,
        // then sort client-side so the UI still works.
        if (err.code === 'failed-precondition' && Object.keys(filters).length > 0) {
          const fallbackConstraints: QueryConstraint[] = [];
          if (filters.reporterId) fallbackConstraints.push(where('reporterId', '==', filters.reporterId));
          else if (filters.status) fallbackConstraints.push(where('status', '==', filters.status));

          const fallbackQ = query(
            collection(db, ISSUES_COLLECTION).withConverter(issueConverter),
            ...fallbackConstraints,
            limit(pageSize),
          );

          // Return a one-shot snapshot — real-time updates won't fire on this path
          getDocs(fallbackQ)
            .then((snap) => {
              const sorted = snap.docs
                .map((d) => d.data())
                .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
              callback(sorted);
            })
            .catch((fallbackErr) => {
              console.error('listenToIssues fallback error:', fallbackErr);
              onError?.(fallbackErr);
            });
        } else {
          onError?.(err);
        }
      },
    );
  },
};
