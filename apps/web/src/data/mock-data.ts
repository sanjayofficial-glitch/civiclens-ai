/**
 * Mock data for UI-only screens. Codex will replace these with Firestore queries.
 */
import type {
  Issue,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  LeaderboardEntry,
  Notification,
} from '@blockseblock/shared';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const MOCK_USER = {
  uid: 'user-1',
  displayName: 'Alex Rivera',
  email: 'alex@example.com',
  photoURL: null as string | null,
  reputation: 1240,
  badges: ['first-report', 'verified-10', 'streak-7'],
  streakDays: 12,
  issuesReported: 28,
  issuesVerified: 45,
};

export const MOCK_ISSUES: Issue[] = [
  {
    id: 'issue-1',
    reporterId: 'user-2',
    status: 'reported',
    category: 'pothole',
    severity: 'high',
    title: 'Large pothole on Main St',
    description:
      'Deep pothole near the crosswalk causing vehicles to swerve. Needs urgent repair before someone gets hurt.',
    location: {
      geohash: 'abc123',
      geopoint: { latitude: 40.7128, longitude: -74.006 },
      address: '123 Main St, Downtown',
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
      ],
      videos: [],
      thumbnail:
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80',
    },
    verification: { upvotes: 12, downvotes: 1, verifiedBy: ['u1', 'u2'] },
    tags: ['road', 'urgent'],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0.5),
  },
  {
    id: 'issue-2',
    reporterId: 'user-3',
    status: 'verified',
    category: 'streetlight',
    severity: 'medium',
    title: 'Broken streetlight on Oak Ave',
    description: 'Streetlight has been out for two weeks. Area is very dark at night.',
    location: {
      geohash: 'def456',
      geopoint: { latitude: 40.715, longitude: -74.01 },
      address: '456 Oak Ave',
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1519501025260-65f15a567804?w=800&q=80',
      ],
      videos: [],
    },
    verification: { upvotes: 24, downvotes: 0, verifiedBy: ['u1', 'u3', 'u4'] },
    tags: ['lighting'],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    id: 'issue-3',
    reporterId: 'user-1',
    status: 'in_progress',
    category: 'water_leak',
    severity: 'critical',
    title: 'Water main leak flooding sidewalk',
    description: 'Active water leak creating ice hazard in winter months.',
    location: {
      geohash: 'ghi789',
      geopoint: { latitude: 40.71, longitude: -74.003 },
      address: '789 River Rd',
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1548839140-29a7492991ff?w=800&q=80',
      ],
      videos: [],
    },
    verification: { upvotes: 31, downvotes: 2, verifiedBy: ['u2', 'u5'] },
    tags: ['water', 'emergency'],
    createdAt: daysAgo(0.5),
    updatedAt: daysAgo(0.1),
  },
  {
    id: 'issue-4',
    reporterId: 'user-4',
    status: 'resolved',
    category: 'garbage',
    severity: 'low',
    title: 'Overflowing trash bin at park',
    description: 'Park trash bin has been overflowing for days.',
    location: {
      geohash: 'jkl012',
      geopoint: { latitude: 40.718, longitude: -74.008 },
      address: 'Central Park West',
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b782?w=800&q=80',
      ],
      videos: [],
    },
    verification: { upvotes: 8, downvotes: 0, verifiedBy: ['u1'] },
    resolution: {
      resolvedAt: daysAgo(1),
      resolvedBy: 'official-1',
      resolutionNotes: 'Sanitation crew emptied and replaced liner.',
      beforeAfterPhotos: [],
    },
    tags: ['sanitation'],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: 'issue-5',
    reporterId: 'user-5',
    status: 'reported',
    category: 'graffiti',
    severity: 'medium',
    title: 'Graffiti on community center wall',
    description: 'Vandalism on the north-facing wall of the community center.',
    location: {
      geohash: 'mno345',
      geopoint: { latitude: 40.714, longitude: -74.012 },
      address: 'Community Center, 5th St',
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1499781350153-2f896902b661?w=800&q=80',
      ],
      videos: [],
    },
    verification: { upvotes: 5, downvotes: 1, verifiedBy: [] },
    tags: ['vandalism'],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'issue-6',
    reporterId: 'user-6',
    status: 'verified',
    category: 'sidewalk',
    severity: 'high',
    title: 'Cracked sidewalk — trip hazard',
    description: 'Large crack uplifted creating a serious trip hazard for pedestrians.',
    location: {
      geohash: 'pqr678',
      geopoint: { latitude: 40.716, longitude: -74.005 },
      address: '220 Elm St',
    },
    media: {
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      ],
      videos: [],
    },
    verification: { upvotes: 18, downvotes: 0, verifiedBy: ['u1', 'u2'] },
    tags: ['accessibility'],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    userId: MOCK_USER.uid,
    type: 'verification',
    title: 'Your report was verified',
    body: '12 community members verified your pothole report on Main St.',
    data: { issueId: 'issue-1' },
    read: false,
    createdAt: daysAgo(0.2),
  },
  {
    userId: MOCK_USER.uid,
    type: 'issue_update',
    title: 'Status updated to In Progress',
    body: 'Water main leak on River Rd is now being addressed.',
    data: { issueId: 'issue-3' },
    read: false,
    createdAt: daysAgo(0.5),
  },
  {
    userId: MOCK_USER.uid,
    type: 'comment',
    title: 'New comment on your report',
    body: 'Sarah M.: "I saw this too, very dangerous!"',
    data: { issueId: 'issue-1' },
    read: true,
    createdAt: daysAgo(1),
  },
  {
    userId: MOCK_USER.uid,
    type: 'leaderboard',
    title: 'You moved up to #3!',
    body: 'Great work this week — keep reporting civic issues.',
    data: {},
    read: true,
    createdAt: daysAgo(2),
  },
  {
    userId: MOCK_USER.uid,
    type: 'resolution',
    title: 'Issue resolved',
    body: 'The overflowing trash bin at Central Park has been cleared.',
    data: { issueId: 'issue-4' },
    read: true,
    createdAt: daysAgo(3),
  },
  {
    userId: MOCK_USER.uid,
    type: 'general',
    title: 'Welcome to BlockSeBlock',
    body: 'Start reporting civic issues in your neighborhood today.',
    data: {},
    read: true,
    createdAt: daysAgo(14),
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: 'u-top-1',
    displayName: 'Jordan Kim',
    photoURL: null,
    score: 2840,
    issuesReported: 52,
    issuesVerified: 89,
    period: 'weekly',
  },
  {
    userId: 'u-top-2',
    displayName: 'Sam Patel',
    photoURL: null,
    score: 2150,
    issuesReported: 41,
    issuesVerified: 67,
    period: 'weekly',
  },
  {
    userId: MOCK_USER.uid,
    displayName: MOCK_USER.displayName,
    photoURL: null,
    score: 1240,
    issuesReported: 28,
    issuesVerified: 45,
    period: 'weekly',
  },
  {
    userId: 'u-top-4',
    displayName: 'Taylor Brooks',
    photoURL: null,
    score: 980,
    issuesReported: 22,
    issuesVerified: 38,
    period: 'weekly',
  },
  {
    userId: 'u-top-5',
    displayName: 'Casey Nguyen',
    photoURL: null,
    score: 870,
    issuesReported: 19,
    issuesVerified: 31,
    period: 'weekly',
  },
];

export const MOCK_BADGES = [
  { id: 'first-report', name: 'First Report', icon: '🎯', description: 'Submitted your first civic issue' },
  { id: 'verified-10', name: 'Community Voice', icon: '✅', description: 'Verified 10 community reports' },
  { id: 'streak-7', name: '7-Day Streak', icon: '🔥', description: 'Active 7 days in a row' },
  { id: 'photo-pro', name: 'Photo Pro', icon: '📸', description: 'Added photos to 5 reports' },
  { id: 'map-explorer', name: 'Map Explorer', icon: '🗺️', description: 'Explored 20 map locations' },
];

export const MOCK_COMMENTS = [
  {
    id: 'c1',
    userId: 'user-2',
    displayName: 'Sarah M.',
    text: 'I saw this too, very dangerous! Cars are swerving into the bike lane.',
    createdAt: daysAgo(0.8),
  },
  {
    id: 'c2',
    userId: 'user-3',
    displayName: 'Mike T.',
    text: 'Reported this to 311 last week as well. Glad it\'s on the map now.',
    createdAt: daysAgo(0.5),
  },
];

export const MOCK_STATUS_HISTORY = [
  { status: 'reported' as IssueStatus, at: daysAgo(1), by: 'Alex Rivera' },
  { status: 'verified' as IssueStatus, at: daysAgo(0.7), by: 'Community' },
];

export const MOCK_STATS = {
  totalReports: 1247,
  resolvedThisWeek: 89,
  activeIssues: 342,
  communityVerifications: 4521,
};

export const ISSUE_FILTERS: { value: IssueStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reported', label: 'Reported' },
  { value: 'verified', label: 'Verified' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export const CATEGORY_OPTIONS: { value: IssueCategory; label: string }[] = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'streetlight', label: 'Streetlight' },
  { value: 'water_leak', label: 'Water Leak' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'graffiti', label: 'Graffiti' },
  { value: 'sidewalk', label: 'Sidewalk' },
  { value: 'other', label: 'Other' },
];

export const SEVERITY_OPTIONS: { value: IssueSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function getIssueById(id: string): Issue | undefined {
  return MOCK_ISSUES.find((i) => i.id === id);
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
