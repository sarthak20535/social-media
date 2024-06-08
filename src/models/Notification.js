const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who receives the notification
    type: { type: String, enum: ['like', 'comment'], required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who triggered the notification
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
