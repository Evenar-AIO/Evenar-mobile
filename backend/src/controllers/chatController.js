const { getDB } = require('../config/db');
const { getIO } = require('../config/socket');
const path = require('path');
const { createNotification } = require('./notificationController');

async function getConversations(req, res) {
  try {
    const db = getDB();
    const { userId, role } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = {};
    if (role === 'customer') {
      filter = { customerId: userId, isDeletedByCustomer: false };
    } else if (role === 'event_owner') {
      filter = {
        $or: [
          { eventOwnerId: userId, isDeletedByOwner: false },
          { customerId: userId, isDeletedByCustomer: false },
        ],
      };
    }
    const [conversations, total] = await Promise.all([
      db.collection('conversations')
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('conversations').countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherLegacyId = role === 'customer'
          ? conv.eventOwnerId
          : (conv.eventOwnerId === userId ? conv.customerId : conv.eventOwnerId);
        const [unreadCount, lastMessage, otherUser] = await Promise.all([
          db.collection('messages').countDocuments({
            conversationId: conv.legacyId,
            senderId: { $ne: userId },
            isRead: false,
          }),
          db.collection('messages')
            .find({ conversationId: conv.legacyId })
            .sort({ createdAt: -1 })
            .limit(1)
            .next(),
          db.collection('users').findOne(
            { legacyId: otherLegacyId },
            { projection: { username: 1, avatar: 1, legacyId: 1 } }
          ),
        ]);

        return {
          ...conv,
          unreadCount,
          lastMessage: lastMessage
            ? {
                content: lastMessage.messageContent,
                type: lastMessage.messageType,
                sentAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          otherUser: otherUser
            ? { id: otherUser.legacyId, username: otherUser.username, avatar: otherUser.avatar }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getMessages(req, res) {
  try {
    const db = getDB();
    const { userId, role } = req.user;
    const convLegacyId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const conv = await db.collection('conversations').findOne({ legacyId: convLegacyId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const hasAccess =
      role === 'admin' ||
      (role === 'customer' && conv.customerId === userId) ||
      (role === 'event_owner' && (conv.eventOwnerId === userId || conv.customerId === userId));

    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    const [messages, total] = await Promise.all([
      db.collection('messages')
        .find({ conversationId: convLegacyId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('messages').countDocuments({ conversationId: convLegacyId }),
    ]);

    const messageIds = messages.map((m) => m.legacyId);
    const attachments = await db
      .collection('fileAttachments')
      .find({ messageId: { $in: messageIds } })
      .toArray();

    const attachmentMap = attachments.reduce((acc, att) => {
      if (!acc[att.messageId]) acc[att.messageId] = [];
      acc[att.messageId].push(att);
      return acc;
    }, {});

    const messagesWithAttachments = messages.map((m) => ({
      ...m,
      attachments: attachmentMap[m.legacyId] || [],
    }));

    await db.collection('messages').updateMany(
      { conversationId: convLegacyId, senderId: { $ne: userId }, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({
      success: true,
      data: messagesWithAttachments.reverse(),
      conversation: conv,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function sendMessage(req, res) {
  try {
    const db = getDB();
    const { userId, role, username } = req.user;
    const now = new Date();

    let { conversationId, eventId, recipientId, subject, messageContent } = req.body;
    conversationId = conversationId ? parseInt(conversationId) : null;
    eventId = eventId ? parseInt(eventId) : null;
    recipientId = recipientId ? parseInt(recipientId) : null;

    let conv;

    if (conversationId) {
      conv = await db.collection('conversations').findOne({ legacyId: conversationId });
      if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

      const hasAccess =
        role === 'admin' ||
        (role === 'customer' && conv.customerId === userId) ||
        (role === 'event_owner' && (conv.eventOwnerId === userId || conv.customerId === userId));
      if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    } else {
      if (!recipientId || !subject) {
        return res.status(400).json({ success: false, message: 'recipientId and subject required for new conversation' });
      }

      const customerId = role === 'customer' ? userId : recipientId;
      const eventOwnerId = role === 'event_owner' ? userId : recipientId;

      const lastConv = await db
        .collection('conversations')
        .find()
        .sort({ legacyId: -1 })
        .limit(1)
        .next();
      const newLegacyId = (lastConv?.legacyId || 0) + 1;

      const newConv = {
        legacyId: newLegacyId,
        customerId,
        eventOwnerId,
        eventId: eventId || null,
        subject,
        status: 'active',
        lastMessageAt: now,
        createdBy: userId,
        isDeletedByCustomer: false,
        isDeletedByOwner: false,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('conversations').insertOne(newConv);
      conv = newConv;
      conversationId = newLegacyId;
    }

    const hasFile = req.files?.length > 0;
    const messageType = hasFile ? (req.files[0].mimetype.startsWith('image/') ? 'image' : 'file') : 'text';

    const lastMsg = await db.collection('messages').find().sort({ legacyId: -1 }).limit(1).next();
    const newMsgLegacyId = (lastMsg?.legacyId || 0) + 1;

    const newMessage = {
      legacyId: newMsgLegacyId,
      conversationId,
      senderId: userId,
      messageContent: messageContent || (hasFile ? '' : ''),
      messageType,
      isRead: false,
      readAt: null,
      isEdited: false,
      editedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('messages').insertOne(newMessage);

    await db.collection('conversations').updateOne(
      { legacyId: conversationId },
      { $set: { lastMessageAt: now, updatedAt: now, status: 'active' } }
    );

    // Create notification for the other participant
    const recipientUserId = conv.customerId === userId ? conv.eventOwnerId : conv.customerId;
    try {
      const title = `${username || 'Ai đó'} đã gửi cho bạn 1 tin nhắn`;
      const content = messageContent ? String(messageContent).slice(0, 140) : 'Bạn có tin nhắn mới';
      await createNotification(db, {
        userId: recipientUserId,
        title,
        content,
        notificationType: 'message',
        relatedId: String(conversationId),
        priority: 'normal',
      });
    } catch {
      // Notification not critical — chat still succeeds
    }

    // Handle file attachments
    let savedAttachments = [];
    if (hasFile) {
      const lastAtt = await db.collection('fileAttachments').find().sort({ legacyId: -1 }).limit(1).next();
      let attLegacyId = (lastAtt?.legacyId || 0) + 1;

      const attDocs = req.files.map((file) => ({
        legacyId: attLegacyId++,
        messageId: newMsgLegacyId,
        originalFilename: file.originalname,
        storedFilename: file.filename,
        filePath: `/uploads/attachments/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: now,
      }));

      await db.collection('fileAttachments').insertMany(attDocs);
      savedAttachments = attDocs;
    }

    const responseMessage = { ...newMessage, attachments: savedAttachments };

    try {
      const io = getIO();
      io.to(`conv_${conversationId}`).emit('new_message', responseMessage);

      // Also emit notification to recipient (người còn lại trong hội thoại)
      io.emit(`notification_${recipientUserId}`, {
        type: 'new_message',
        conversationId,
        message: responseMessage,
      });
    } catch {
      // Socket not critical — HTTP response still succeeds
    }

    res.status(201).json({ success: true, data: responseMessage });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getConversations, getMessages, sendMessage };
