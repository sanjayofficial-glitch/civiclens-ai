import { BaseRepository } from './baseRepository';

export interface BackendCommentRecord {
  issueId: string;
  userId: string;
  text: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export class CommentRepository extends BaseRepository<BackendCommentRecord> {
  constructor() {
    super('comments');
  }
}
