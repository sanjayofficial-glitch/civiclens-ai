export type UserRole = 'Citizen' | 'Moderator' | 'Admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Rejected';

export interface Issue {
  id: string;
  authorId: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  mediaUrls: string[];
  status: IssueStatus;
  upvotes: number;
  downvotes: number;
  aiReview: {
    confidence: number;
    category: string;
    isDuplicate: boolean;
    duplicateOf?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  id: string;
  issueId: string;
  userId: string;
  type: 'up' | 'down';
  createdAt: Date;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

// Add other models as requested (Analytics, Leaderboard, Badges, ActivityLogs)
