const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const io = require('../server');

// Add a comment to a post
exports.addComment = async (req, res) => {
    const { text } = req.body;
    try {
        const post = await Post.findById(req.params.postId).populate('user');
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = new Comment({
            post: req.params.postId,
            user: req.user.id,
            text
        });

        await comment.save();
        post.comments.push(comment);
        await post.save();

        // Create and send a notification for the post's author
        if (post.user.id !== req.user.id) {
            const notification = new Notification({
                user: post.user.id,
                type: 'comment',
                post: post.id,
                fromUser: req.user.id,
                message: `${req.user.username} commented on your post`
            });
            await notification.save();

            // Emit notification event to the user
            io.to(post.user.id).emit('notification', notification);
        }

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// getComments function with pagination and filtering
exports.getComments = async (req, res) => {
    const { page = 1, limit = 10, user, sort = 'createdAt', order = 'desc' } = req.query;

    const query = { post: req.params.postId };
    if (user) {
        query.user = user;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOption = { [sort]: sortOrder };

    try {
        const comments = await Comment.find(query)
            .populate('user')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalComments = await Comment.countDocuments(query);

        res.json({
            comments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalComments / limit),
                totalComments,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.user.toString() !== req.user.id) return res.status(403).json({ message: 'User not authorized' });

        await comment.remove();
        res.json({ message: 'Comment removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
