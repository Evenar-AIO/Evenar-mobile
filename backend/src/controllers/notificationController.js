const { getDB } = require('../config/db');

async function getNotifications(req, res) {
  try {
    const db = getDB();
    const { userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    const filter = {
      userId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      db.collection('notifications')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('notifications').countDocuments(filter),
      db.collection('notifications').countDocuments({ userId, isRead: false }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function markAsRead(req, res) {
  try {
    const db = getDB();
    const { userId } = req.user;
    const { ObjectId } = require('mongodb');

    let filter;
    if (req.params.id === 'all') {
      filter = { userId, isRead: false };
    } else {
      try {
        filter = { _id: new ObjectId(req.params.id), userId };
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid notification ID' });
      }
    }

    const result = await db.collection('notifications').updateMany(filter, {
      $set: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('markAsRead error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createNotification(db, { userId, title, content, notificationType, relatedId, priority = 'normal' }) {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + 30);

  await db.collection('notifications').insertOne({
    userId,
    title,
    content,
    notificationType,
    relatedId,
    isRead: false,
    readAt: null,
    priority,
    createdAt: now,
    expiresAt: expiry,
  });
}

module.exports = { getNotifications, markAsRead, createNotification };
