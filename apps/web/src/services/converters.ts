import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import type { Issue, User, Comment, Vote, Notification, LeaderboardEntry } from '@blockseblock/shared';

// Generic converter creator
function createConverter<T extends { id?: string; uid?: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: T): DocumentData {
      // Remove id/uid from the data payload as it's the document ID itself
      const { id, uid, ...data } = modelObject as any;
      return data;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions
    ): T {
      const data = snapshot.data(options);
      
      // Inject id or uid depending on what exists in the model
      return {
        ...data,
        id: snapshot.id,
        uid: snapshot.id, // We'll just provide both and the type cast will enforce usage
      } as unknown as T;
    }
  };
}

export const issueConverter = createConverter<Issue>();
export const userConverter = createConverter<User>();
export const commentConverter = createConverter<Comment & { id: string }>();
export const voteConverter = createConverter<Vote & { id: string }>();
export const notificationConverter = createConverter<Notification & { id: string }>();
export const leaderboardConverter = createConverter<LeaderboardEntry & { id: string }>();
