const { getDB } = require("../config/db");

async function createFeedback(req, res) {
  try {
    const db = getDB();
    const { userId } = req.user;
    const { eventId, orderId, rating, content } = req.body;

    if (!eventId || !orderId || !rating || !content) {
      return res.status(400).json({
        success: false,
        message: "eventId, orderId, rating, content are required",
      });
    }

    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const order = await db.collection("orders").findOne({
      legacyId: parseInt(orderId),
      userId,
    });
    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You can only review events you have ordered",
      });
    }

    const existing = await db.collection("feedbacks").findOne({
      userId,
      eventId: parseInt(eventId),
      orderId: parseInt(orderId),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted feedback for this order",
      });
    }

    const now = new Date();
    const newFeedback = {
      userId,
      eventId: parseInt(eventId),
      orderId: parseInt(orderId),
      rating: ratingNum,
      content,
      isApproved: false,
      adminResponse: null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("feedbacks").insertOne(newFeedback);

    res.status(201).json({
      success: true,
      data: { ...newFeedback, _id: result.insertedId },
    });
  } catch (err) {
    console.error("createFeedback error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getFeedbackByEvent(req, res) {
  try {
    const db = getDB();
    const eventId = parseInt(req.params.eventId);
    const { userId, role } = req.user || {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { eventId };

    if (!role || role === "customer") {
      filter.isApproved = true;
    } else if (role === "event_owner") {
      const event = await db
        .collection("events")
        .findOne({ legacyId: eventId });
      if (!event || event.organizerId !== userId) {
        filter.isApproved = true;
      }
    }

    const [feedbacks, total] = await Promise.all([
      db
        .collection("feedbacks")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("feedbacks").countDocuments(filter),
    ]);

    const userIds = [...new Set(feedbacks.map((f) => f.userId))];
    const users = await db
      .collection("users")
      .find(
        { legacyId: { $in: userIds } },
        { projection: { legacyId: 1, username: 1, avatar: 1 } },
      )
      .toArray();

    const userMap = users.reduce((acc, u) => {
      acc[u.legacyId] = u;
      return acc;
    }, {});

    const enriched = feedbacks.map((f) => ({
      ...f,
      user: userMap[f.userId]
        ? {
            username: userMap[f.userId].username,
            avatar: userMap[f.userId].avatar,
          }
        : null,
    }));

    const stats = await db
      .collection("feedbacks")
      .aggregate([
        { $match: { eventId, isApproved: true } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          },
        },
      ])
      .next();

    res.json({
      success: true,
      data: enriched,
      stats: stats
        ? {
            avgRating: Math.round(stats.avgRating * 10) / 10,
            totalReviews: stats.totalReviews,
            distribution: {
              5: stats.rating5,
              4: stats.rating4,
              3: stats.rating3,
              2: stats.rating2,
              1: stats.rating1,
            },
          }
        : {
            avgRating: 0,
            totalReviews: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getFeedbackByEvent error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { createFeedback, getFeedbackByEvent };
