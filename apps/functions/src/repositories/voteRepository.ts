import { BaseRepository } from './baseRepository';

export interface BackendVoteRecord {
  issueId: string;
  userId: string;
  type: 'upvote' | 'downvote';
  createdAt: FirebaseFirestore.Timestamp;
}

export class VoteRepository extends BaseRepository<BackendVoteRecord> {
  constructor() {
    super('votes');
  }

  docForIssue(issueId: string, userId: string) {
    return this.doc(`${issueId}_${userId}`);
  }
}
