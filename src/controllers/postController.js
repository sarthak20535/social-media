const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Create a post
exports.createPost = async (req, res) => {
    const { content, hashtags } = req.body;
    let fileData = {};
    
    if (req.file) {
        const fileType = req.file.mimetype.split('/')[0];
        fileData[fileType] = req.file.path;
    }

    try {
        const post = new Post({
            user: req.user.id,
            content,
            ...fileData,
            hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : []
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// getPosts function with pagination and filtering
exports.getPosts = async (req, res) => {
    const { page = 1, limit = 10, user, hashtag, sort = 'createdAt', order = 'desc' } = req.query;
    
    const query = {};
    if (user) {
        query.user = user;
    }
    if (hashtag) {
        query.hashtags = { $in: [hashtag] };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOption = { [sort]: sortOrder };

    try {
        const posts = await Post.find(query)
            .populate('user')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments(query);

        res.json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user').populate('comments');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    const { content, hashtags } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.user.toString() !== req.user.id) return res.status(403).json({ message: 'User not authorized' });

        post.content = content || post.content;
        post.hashtags = hashtags ? hashtags.split(',').map(tag => tag.trim()) : post.hashtags;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.user.toString() !== req.user.id) return res.status(403).json({ message: 'User not authorized' });

        await post.remove();
        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Middleware for file upload
exports.uploadMiddleware = upload.single('file');
