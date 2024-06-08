const Notification = require('../models/Notification');

// Get notifications for the logged-in user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .populate('fromUser', 'username')
            .populate('post')
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        if (notification.user.toString() !== req.user.id) return res.status(403).json({ message: 'User not authorized' });

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        if (notification.user.toString() !== req.user.id) return res.status(403).json({ message: 'User not authorized' });

        await notification.remove();
        res.json({ message: 'Notification removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
