const { getDB } = require("../config/db");
const { getIO } = require("../config/socket");
const { createNotification } = require("./notificationController");

async function submitSupport(req, res) {
  try {
    const db = getDB();
    const { userId, email } = req.user;
    const { subject, content, category, priority, eventId, orderId } = req.body;

    if (!subject || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "subject, content, category are required",
      });
    }

    const now = new Date();

    const lastItem = await db
      .collection("supportItems")
      .find()
      .sort({ legacyId: -1 })
      .limit(1)
      .next();
    const newLegacyId = (lastItem?.legacyId || 0) + 1;

    const newItem = {
      legacyId: newLegacyId,
      userId,
      fromEmail: email || "",
      toEmail: "support@eventticket.vn",
      subject,
      sendDate: now,
      sendTimestamp: now,
      content,
      status: "pending",
      priority: priority || "medium",
      category,
      createdDate: now,
      lastModified: now,
      adminResponse: null,
      assignedAdminId: null,
      eventId: eventId ? parseInt(eventId) : null,
      orderId: orderId ? parseInt(orderId) : null,
    };

    await db.collection("supportItems").insertOne(newItem);

    try {
      await createNotification(db, {
        userId,
        title: "Yêu cầu hỗ trợ đã được tạo",
        content: subject,
        notificationType: "support",
        relatedId: String(newLegacyId),
        priority: "normal",
      });
    } catch {}

    try {
      const io = getIO();
      io.emit(`notification_${userId}`, {
        type: "support_created",
        supportId: newLegacyId,
      });
    } catch {}

    let savedAttachments = [];
    if (req.files?.length > 0) {
      const lastAtt = await db
        .collection("supportAttachments")
        .find()
        .sort({ legacyId: -1 })
        .limit(1)
        .next();
      let attLegacyId = (lastAtt?.legacyId || 0) + 1;

      const attDocs = req.files.map((file) => ({
        legacyId: attLegacyId++,
        supportId: newLegacyId,
        fileName: file.filename,
        originalFileName: file.originalname,
        filePath: `/uploads/support/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadDate: now,
        uploadTimestamp: now,
      }));

      await db.collection("supportAttachments").insertMany(attDocs);
      savedAttachments = attDocs;
    }

    res.status(201).json({
      success: true,
      data: { ...newItem, attachments: savedAttachments },
      message: "Support request submitted successfully",
    });
  } catch (err) {
    console.error("submitSupport error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function listSupport(req, res) {
  try {
    const db = getDB();
    const { userId, role } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, category, priority } = req.query;

    let filter = {};

    if (role === "customer") {
      filter.userId = userId;
    } else if (role === "event_owner") {
      const events = await db
        .collection("events")
        .find({ organizerId: userId }, { projection: { legacyId: 1 } })
        .toArray();
      const eventIds = events.map((e) => e.legacyId);
      filter.$or = eventIds.length
        ? [{ userId }, { eventId: { $in: eventIds } }]
        : [{ userId }];
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const [items, total] = await Promise.all([
      db
        .collection("supportItems")
        .find(filter)
        .sort({ sendTimestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("supportItems").countDocuments(filter),
    ]);

    const supportIds = items.map((i) => i.legacyId);
    const attachments = await db
      .collection("supportAttachments")
      .find({ supportId: { $in: supportIds } })
      .toArray();

    const attMap = attachments.reduce((acc, att) => {
      if (!acc[att.supportId]) acc[att.supportId] = [];
      acc[att.supportId].push(att);
      return acc;
    }, {});

    const enriched = items.map((item) => ({
      ...item,
      attachments: attMap[item.legacyId] || [],
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listSupport error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { submitSupport, listSupport };
