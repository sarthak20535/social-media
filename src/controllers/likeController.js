const Post = require('../models/Post');
const Notification = require('../models/Notification');
const io = require('../server');

// Like a post
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user');
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(req.user.id)) return res.status(400).json({ message: 'Post already liked' });

        post.likes.push(req.user.id);
        await post.save();

        // Create and send a notification for the post's author
        if (post.user.id !== req.user.id) {
            const notification = new Notification({
                user: post.user.id,
                type: 'like',
                post: post.id,
                fromUser: req.user.id,
                message: `${req.user.username} liked your post`
            });
            await notification.save();

            // Emit notification event to the user
            io.to(post.user.id).emit('notification', notification);
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (!post.likes.includes(req.user.id)) return res.status(400).json({ message: 'Post not yet liked' });

        post.likes = post.likes.filter(like => like.toString() !== req.user.id);
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
