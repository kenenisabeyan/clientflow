const Message = require('../models/Message');
const User = require('../models/User');

exports.getMessages = async (req, res, next) => {
  try {
    const { channel = 'general', recipientId } = req.query;
    let query: any = {};

    if (recipientId) {
      // Direct message between user and recipient
      query = {
        $or: [
          { sender: req.user.id, recipient: recipientId },
          { sender: recipientId, recipient: req.user.id }
        ]
      };
    } else {
      // Channel messages (e.g. general, client-support, dev-team)
      query = { channel };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name role email')
      .populate('recipient', 'name role email')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, count: messages.length, messages });
  } catch (err) { next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content, channel = 'general', recipient } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      recipient: recipient || null,
      channel: recipient ? 'direct' : channel,
      content: content.trim()
    });

    const populated = await Message.findById(newMessage._id)
      .populate('sender', 'name role email')
      .populate('recipient', 'name role email');

    res.status(201).json({ success: true, message: populated });
  } catch (err) { next(err); }
};
