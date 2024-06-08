const express = require('express');
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get notifications for the logged-in user
router.get('/', auth, getNotifications);

// Mark a notification as read
router.put('/:id/read', auth, markAsRead);

// Delete a notification
router.delete('/:id', auth, deleteNotification);

module.exports = router;
