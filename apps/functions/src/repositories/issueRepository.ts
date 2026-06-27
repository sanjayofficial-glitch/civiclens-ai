import { BaseRepository } from './baseRepository';

export interface BackendIssueRecord {
  id: string;
  reporterId: string;
  status: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  location: {
    geohash: string;
    geopoint: FirebaseFirestore.GeoPoint;
    address: string;
  };
  media: {
    images: string[];
    videos: string[];
    thumbnail?: string;
  };
  aiAnalysis?: Record<string, unknown>;
  verification: {
    upvotes: number;
    downvotes: number;
    verifiedBy: string[];
    verifiedAt?: FirebaseFirestore.Timestamp;
  };
  assignedTo?: string;
  resolution?: Record<string, unknown>;
  tags: string[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export class IssueRepository extends BaseRepository<BackendIssueRecord> {
  constructor() {
    super('issues');
  }
}

