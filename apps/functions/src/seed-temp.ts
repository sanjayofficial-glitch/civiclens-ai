import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';

const Timestamp = admin.firestore.Timestamp;
const GeoPoint = admin.firestore.GeoPoint;

const ts = (daysAgo: number) =>
  Timestamp.fromDate(new Date(Date.now() - daysAgo * 86400000));

const DEMO_USER = {
  uid: 'demo-reporter-001',
  displayName: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  photoURL: null,
  phoneNumber: null,
  role: 'citizen',
  reputation: 47,
  issuesReported: 6,
  issuesVerified: 3,
  badges: ['first-report', 'pothole-hunter', 'photo-pro'],
  streakDays: 7,
  lastActive: ts(0),
  createdAt: ts(30),
  updatedAt: ts(0),
};

const SECOND_USER = {
  uid: 'demo-reporter-002',
  displayName: 'Jamie Chen',
  email: 'jamie.chen@example.com',
  photoURL: null,
  phoneNumber: null,
  role: 'citizen',
  reputation: 23,
  issuesReported: 3,
  issuesVerified: 5,
  badges: ['first-report', 'detail-oriented'],
  streakDays: 3,
  lastActive: ts(0),
  createdAt: ts(25),
  updatedAt: ts(0),
};

const OFFICIAL_USER = {
  uid: 'demo-official-001',
  displayName: 'Maria Santos',
  email: 'maria.santos@nyc.gov',
  photoURL: null,
  phoneNumber: null,
  role: 'official',
  reputation: 150,
  issuesReported: 0,
  issuesVerified: 20,
  badges: ['top-contributor'],
  streakDays: 30,
  lastActive: ts(0),
  createdAt: ts(60),
  updatedAt: ts(0),
};

const issues = [
  {
    id: 'demo-pothole-001',
    reporterId: DEMO_USER.uid,
    status: 'verified',
    category: 'pothole',
    severity: 'critical',
    title: 'Deep pothole on Broadway near Canal St intersection',
    description:
      'Large pothole approximately 2 feet wide and 6 inches deep on Broadway just south of Canal Street. Multiple vehicles have suffered tire damage. The hole is filled with water making it hard to see. This needs urgent repair before someone gets seriously injured.',
    location: {
      geohash: 'dr5reg',
      geopoint: new GeoPoint(40.7188, -74.002),
      address: 'Broadway & Canal St, New York, NY 10013',
    },
    media: { images: [], videos: [], thumbnail: undefined },
    aiAnalysis: {
      category: 'pothole',
      severity: 'critical',
      confidence: 0.96,
      suggestedTitle: 'Deep pothole on Broadway near Canal St',
      suggestedDescription:
        'Large water-filled pothole at Broadway and Canal St intersection causing vehicle damage',
      suggestedTags: ['pothole', 'water-filled', 'traffic-hazard', 'urgent'],
      duplicateProbability: 0.15,
    },
    verification: {
      upvotes: 12,
      downvotes: 1,
      verifiedBy: [SECOND_USER.uid],
      verifiedAt: ts(2),
    },
    tags: ['pothole', 'road-damage', 'traffic-hazard', 'urgent'],
    assignedTo: OFFICIAL_USER.uid,
    createdAt: ts(7),
    updatedAt: ts(2),
  },
  {
    id: 'demo-light-001',
    reporterId: SECOND_USER.uid,
    status: 'verified',
    category: 'streetlight',
    severity: 'medium',
    title: 'Three streetlights out on 5th Ave between 23rd and 24th',
    description:
      'Three consecutive streetlights are not working on 5th Avenue between 23rd and 24th Street. The sidewalk is very dark at night, making it unsafe for pedestrians. This has been going on for over a week now.',
    location: {
      geohash: 'dr5rff',
      geopoint: new GeoPoint(40.741, -73.9896),
      address: '5th Ave & 23rd St, New York, NY 10010',
    },
    media: { images: [], videos: [], thumbnail: undefined },
    aiAnalysis: {
      category: 'streetlight',
      severity: 'medium',
      confidence: 0.88,
      suggestedTitle: 'Multiple streetlights out on 5th Ave',
      suggestedDescription:
        'Three consecutive streetlights not working on 5th Avenue between 23rd and 24th Street',
      suggestedTags: ['streetlight', 'safety', 'dark-sidewalk'],
      duplicateProbability: 0.05,
    },
    verification: {
      upvotes: 7,
      downvotes: 0,
      verifiedBy: [DEMO_USER.uid],
      verifiedAt: ts(3),
    },
    tags: ['streetlight', 'safety', 'lighting'],
    createdAt: ts(10),
    updatedAt: ts(3),
  },
  {
    id: 'demo-water-001',
    reporterId: DEMO_USER.uid,
    status: 'in_progress',
    category: 'water_leak',
    severity: 'high',
    title: 'Water main leak flooding sidewalk on Houston St',
    description:
      'Water is bubbling up through a crack in the pavement on Houston Street near Mulberry. The leak has been running for 3 days and the sidewalk is constantly wet and slippery. Some water is pooling into the street as well. NYC DEP was notified but no action taken yet.',
    location: {
      geohash: 'dr5rec',
      geopoint: new GeoPoint(40.7243, -73.9958),
      address: 'Houston St & Mulberry St, New York, NY 10012',
    },
    media: { images: [], videos: [], thumbnail: undefined },
    aiAnalysis: {
      category: 'water_leak',
      severity: 'high',
      confidence: 0.92,
      suggestedTitle: 'Water main leak on Houston St',
      suggestedDescription:
        'Water bubbling through pavement crack on Houston Street near Mulberry, flooding sidewalk for 3 days',
      suggestedTags: ['water-leak', 'flooding', 'sidewalk-hazard', 'urgent'],
      duplicateProbability: 0.08,
    },
    verification: {
      upvotes: 15,
      downvotes: 0,
      verifiedBy: [SECOND_USER.uid],
      verifiedAt: ts(4),
    },
    tags: ['water-leak', 'flooding', 'sidewalk-hazard', 'infrastructure'],
    assignedTo: OFFICIAL_USER.uid,
    createdAt: ts(6),
    updatedAt: ts(1),
  },
  {
    id: 'demo-garbage-001',
    reporterId: DEMO_USER.uid,
    status: 'resolved',
    category: 'garbage',
    severity: 'high',
    title: 'Illegal dumping on empty lot at 141st and Lenox Ave',
    description:
      'Someone has been dumping construction debris and household garbage on the vacant lot at the corner of 141st Street and Lenox Avenue. The pile has grown significantly over the past two weeks and is attracting rats. Needs cleanup and enforcement.',
    location: {
      geohash: 'dr5rgj',
      geopoint: new GeoPoint(40.8188, -73.9368),
      address: '141st St & Lenox Ave, New York, NY 10037',
    },
    media: { images: [], videos: [], thumbnail: undefined },
    aiAnalysis: {
      category: 'garbage',
      severity: 'high',
      confidence: 0.94,
      suggestedTitle: 'Illegal dumping on Lenox Ave vacant lot',
      suggestedDescription:
        'Construction debris and household garbage pile on vacant lot at 141st and Lenox Ave attracting rats',
      suggestedTags: [
        'illegal-dumping',
        'construction-debris',
        'rats',
        'sanitation',
      ],
      duplicateProbability: 0.12,
    },
    verification: {
      upvotes: 20,
      downvotes: 0,
      verifiedBy: [SECOND_USER.uid],
      verifiedAt: ts(12),
    },
    resolution: {
      resolvedAt: ts(1),
      resolvedBy: OFFICIAL_USER.uid,
      resolutionNotes:
        'Lot cleared by sanitation department. Fence installed to prevent future dumping.',
      beforeAfterPhotos: [],
    },
    tags: ['illegal-dumping', 'sanitation', 'rats', 'resolved'],
    assignedTo: OFFICIAL_USER.uid,
    createdAt: ts(20),
    updatedAt: ts(1),
  },
  {
    id: 'demo-graffiti-001',
    reporterId: SECOND_USER.uid,
    status: 'reported',
    category: 'graffiti',
    severity: 'low',
    title: 'Graffiti on historic building facade on Bleecker St',
    description:
      'Large spray-painted graffiti tags on the front of the historic building at 212 Bleecker Street. The tags cover about 15 feet of the ground-floor facade. While not structurally damaging, it detracts from the neighborhood character.',
    location: {
      geohash: 'dr5rff',
      geopoint: new GeoPoint(40.7298, -73.9954),
      address: '212 Bleecker St, New York, NY 10012',
    },
    media: { images: [], videos: [], thumbnail: undefined },
    aiAnalysis: {
      category: 'graffiti',
      severity: 'low',
      confidence: 0.97,
      suggestedTitle: 'Graffiti on Bleecker St building',
      suggestedDescription:
        'Large spray-painted tags on historic building facade at 212 Bleecker Street',
      suggestedTags: ['graffiti', 'vandalism', 'historic-building'],
      duplicateProbability: 0.03,
    },
    verification: { upvotes: 3, downvotes: 0, verifiedBy: [] },
    tags: ['graffiti', 'vandalism', 'historic-building'],
    createdAt: ts(1),
    updatedAt: ts(1),
  },
  {
    id: 'demo-sidewalk-001',
    reporterId: DEMO_USER.uid,
    status: 'reported',
    category: 'sidewalk',
    severity: 'medium',
    title: 'Cracked and lifted sidewalk panels in front of PS 234',
    description:
      'Multiple sidewalk panels are cracked and lifted by tree roots in front of PS 234 elementary school on Greenwich Street. This is a trip hazard for children and parents during school drop-off and pickup. At least 4 panels are raised 2+ inches.',
    location: {
      geohash: 'dr5reg',
      geopoint: new GeoPoint(40.7317, -74.0113),
      address: 'PS 234, 292 Greenwich St, New York, NY 10013',
    },
    media: { images: [], videos: [], thumbnail: undefined },
    aiAnalysis: {
      category: 'sidewalk',
      severity: 'medium',
      confidence: 0.91,
      suggestedTitle: 'Cracked sidewalk at PS 234',
      suggestedDescription:
        'Tree-root damaged sidewalk panels in front of PS 234 elementary school creating trip hazards',
      suggestedTags: ['sidewalk', 'trip-hazard', 'school', 'tree-roots'],
      duplicateProbability: 0.06,
    },
    verification: { upvotes: 5, downvotes: 0, verifiedBy: [] },
    tags: ['sidewalk', 'trip-hazard', 'school-zone', 'tree-roots'],
    createdAt: ts(3),
    updatedAt: ts(3),
  },
  {
    id: 'demo-pothole-002',
    reporterId: OFFICIAL_USER.uid,
    status: 'resolved',
    category: 'pothole',
    severity: 'medium',
    title: 'Pothole on West St bike lane near Chambers St',
    description:
      'Pothole in the protected bike lane on West Street near Chambers Street. Cyclists have to swerve into traffic to avoid it. Approximately 1 foot wide and 3 inches deep. Dangerous for bike commuters.',
    location: {
      geohash: 'dr5reg',
      geopoint: new GeoPoint(40.7164, -74.0142),
      address: 'West St & Chambers St, New York, NY 10007',
    },
    media: { images: [], videos: [], thumbnail: undefined },
    aiAnalysis: {
      category: 'pothole',
      severity: 'medium',
      confidence: 0.89,
      suggestedTitle: 'Pothole in bike lane on West St',
      suggestedDescription:
        'Pothole in protected bike lane on West Street near Chambers Street forcing cyclists into traffic',
      suggestedTags: ['pothole', 'bike-lane', 'cycling-safety'],
      duplicateProbability: 0.04,
    },
    verification: {
      upvotes: 9,
      downvotes: 0,
      verifiedBy: [DEMO_USER.uid],
      verifiedAt: ts(14),
    },
    resolution: {
      resolvedAt: ts(0),
      resolvedBy: OFFICIAL_USER.uid,
      resolutionNotes: 'Pothole filled by DOT. Bike lane surface restored.',
      beforeAfterPhotos: [],
    },
    tags: ['pothole', 'bike-lane', 'cycling-safety', 'resolved'],
    assignedTo: OFFICIAL_USER.uid,
    createdAt: ts(15),
    updatedAt: ts(0),
  },
];

const votes = [
  {
    issueId: 'demo-pothole-001',
    userId: SECOND_USER.uid,
    type: 'upvote',
    createdAt: ts(6),
  },
  {
    issueId: 'demo-pothole-001',
    userId: OFFICIAL_USER.uid,
    type: 'upvote',
    createdAt: ts(5),
  },
  {
    issueId: 'demo-light-001',
    userId: DEMO_USER.uid,
    type: 'upvote',
    createdAt: ts(9),
  },
  {
    issueId: 'demo-light-001',
    userId: OFFICIAL_USER.uid,
    type: 'upvote',
    createdAt: ts(8),
  },
  {
    issueId: 'demo-water-001',
    userId: SECOND_USER.uid,
    type: 'upvote',
    createdAt: ts(5),
  },
  {
    issueId: 'demo-water-001',
    userId: OFFICIAL_USER.uid,
    type: 'upvote',
    createdAt: ts(4),
  },
  {
    issueId: 'demo-garbage-001',
    userId: DEMO_USER.uid,
    type: 'upvote',
    createdAt: ts(18),
  },
  {
    issueId: 'demo-garbage-001',
    userId: SECOND_USER.uid,
    type: 'upvote',
    createdAt: ts(17),
  },
  {
    issueId: 'demo-graffiti-001',
    userId: DEMO_USER.uid,
    type: 'upvote',
    createdAt: ts(1),
  },
  {
    issueId: 'demo-sidewalk-001',
    userId: SECOND_USER.uid,
    type: 'upvote',
    createdAt: ts(2),
  },
  {
    issueId: 'demo-pothole-002',
    userId: DEMO_USER.uid,
    type: 'upvote',
    createdAt: ts(14),
  },
  {
    issueId: 'demo-pothole-002',
    userId: SECOND_USER.uid,
    type: 'upvote',
    createdAt: ts(13),
  },
  {
    issueId: 'demo-pothole-001',
    userId: DEMO_USER.uid,
    type: 'downvote',
    createdAt: ts(6),
  },
];

const comments = [
  {
    issueId: 'demo-pothole-001',
    userId: SECOND_USER.uid,
    userName: 'Jamie Chen',
    text: 'I saw this yesterday, it is really dangerous! Almost hit it with my car. The whole block needs repaving.',
    createdAt: ts(5),
  },
  {
    issueId: 'demo-pothole-001',
    userId: OFFICIAL_USER.uid,
    userName: 'Maria Santos',
    text: 'I have flagged this for DOT inspection. They should be out within 48 hours to assess.',
    createdAt: ts(4),
  },
  {
    issueId: 'demo-water-001',
    userId: SECOND_USER.uid,
    userName: 'Jamie Chen',
    text: 'The water is getting worse. It is now flowing into the street gutter. Someone needs to call DEP again.',
    createdAt: ts(3),
  },
  {
    issueId: 'demo-water-001',
    userId: OFFICIAL_USER.uid,
    userName: 'Maria Santos',
    text: 'DEP has been notified and a crew is scheduled to investigate tomorrow morning.',
    createdAt: ts(2),
  },
  {
    issueId: 'demo-garbage-001',
    userId: DEMO_USER.uid,
    userName: 'Alex Rivera',
    text: 'The rats are getting out of control. I saw at least 5 of them last night. This needs to be cleaned ASAP.',
    createdAt: ts(15),
  },
  {
    issueId: 'demo-garbage-001',
    userId: OFFICIAL_USER.uid,
    userName: 'Maria Santos',
    text: 'Sanitation department has been notified. Cleanup is scheduled for this Friday.',
    createdAt: ts(14),
  },
  {
    issueId: 'demo-garbage-001',
    userId: SECOND_USER.uid,
    userName: 'Jamie Chen',
    text: 'Thank you for taking action on this. The whole neighborhood appreciates it!',
    createdAt: ts(13),
  },
  {
    issueId: 'demo-light-001',
    userId: DEMO_USER.uid,
    userName: 'Alex Rivera',
    text: 'I walk my dog here every night and it is pitch black. Really scary.',
    createdAt: ts(7),
  },
  {
    issueId: 'demo-sidewalk-001',
    userId: SECOND_USER.uid,
    userName: 'Jamie Chen',
    text: 'My kid goes to PS 234. This is a real safety concern for the children.',
    createdAt: ts(2),
  },
  {
    issueId: 'demo-pothole-002',
    userId: DEMO_USER.uid,
    userName: 'Alex Rivera',
    text: 'I bike this route daily. Had to swerve into traffic last week to avoid this. So glad it got fixed!',
    createdAt: ts(10),
  },
];

const leaderboardEntries = [
  {
    userId: DEMO_USER.uid,
    displayName: 'Alex Rivera',
    photoURL: null,
    score: 82,
    issuesReported: 6,
    issuesVerified: 3,
    period: 'all_time',
    updatedAt: ts(0),
    currentRank: 1,
    previousRank: 2,
  },
  {
    userId: DEMO_USER.uid,
    displayName: 'Alex Rivera',
    photoURL: null,
    score: 45,
    issuesReported: 4,
    issuesVerified: 2,
    period: 'monthly',
    updatedAt: ts(0),
    currentRank: 1,
    previousRank: 2,
  },
  {
    userId: SECOND_USER.uid,
    displayName: 'Jamie Chen',
    photoURL: null,
    score: 53,
    issuesReported: 3,
    issuesVerified: 5,
    period: 'all_time',
    updatedAt: ts(0),
    currentRank: 2,
    previousRank: 1,
  },
];

export const seedDemo = onRequest(async (_req, res) => {
  logger.info('Starting seed...');
  try {
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    const batch = db.batch();
    let ops = 0;
    const add = (collection: string, id: string, data: object) => {
      batch.set(db.collection(collection).doc(id), data);
      ops++;
    };

    add('users', DEMO_USER.uid, DEMO_USER);
    add('users', SECOND_USER.uid, SECOND_USER);
    add('users', OFFICIAL_USER.uid, OFFICIAL_USER);
    for (const issue of issues) add('issues', issue.id, issue);
    for (const vote of votes)
      add('votes', `${vote.issueId}_${vote.userId}`, vote);
    for (let i = 0; i < comments.length; i++)
      add(
        'comments',
        `demo-comment-${String(i + 1).padStart(3, '0')}`,
        comments[i],
      );
    for (const lb of leaderboardEntries)
      add('leaderboard', `${lb.period}_${lb.userId}`, lb);

    await batch.commit();
    logger.info(`Seeded ${String(ops)} documents`);
    res.status(200).json({ status: 'ok', count: ops });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Seed failed', err);
    res.status(500).json({ status: 'error', message });
  }
});
