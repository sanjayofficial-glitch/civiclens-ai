import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreate, mockDocUpdate, mockDoc, mockNotificationRepoImpl, mockServerTimestamp } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  const mockDocUpdate = vi.fn();
  const mockDoc = vi.fn(() => ({ update: mockDocUpdate }));
  const mockNotificationRepoImpl = vi.fn(function() {
    return {
      create: mockCreate,
      doc: mockDoc,
    };
  });
  const mockServerTimestamp = vi.fn(() => ({ _method: 'serverTimestamp' }));
  return { mockCreate, mockDocUpdate, mockDoc, mockNotificationRepoImpl, mockServerTimestamp };
});

vi.mock('../../repositories/notificationRepository', () => ({
  NotificationRepository: mockNotificationRepoImpl,
}));

vi.mock('../../lib/firebase', () => ({
  FieldValue: { serverTimestamp: mockServerTimestamp },
}));

import { createNotification, markNotificationRead } from '../../services/notificationService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createNotification', () => {
  it('calls repository create with correct data', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'notif_001' });

    const result = await createNotification({
      userId: 'user_abc',
      type: 'vote',
      title: 'New vote',
      body: 'Someone voted on your issue',
      data: { issueId: 'issue_001' },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 'user_abc',
      type: 'vote',
      title: 'New vote',
      body: 'Someone voted on your issue',
      data: { issueId: 'issue_001' },
    });
    expect(result).toEqual({ id: 'notif_001' });
  });

  it('defaults data to empty object when not provided', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'notif_002' });

    await createNotification({
      userId: 'user_abc',
      type: 'vote',
      title: 'New vote',
      body: 'Someone voted',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 'user_abc',
      type: 'vote',
      title: 'New vote',
      body: 'Someone voted',
      data: {},
    });
  });
});

describe('markNotificationRead', () => {
  it('updates notification document with read and readAt', async () => {
    await markNotificationRead('notif_001');

    expect(mockDoc).toHaveBeenCalledWith('notif_001');
    expect(mockDocUpdate).toHaveBeenCalledWith({
      read: true,
      readAt: { _method: 'serverTimestamp' },
    });
  });
});
