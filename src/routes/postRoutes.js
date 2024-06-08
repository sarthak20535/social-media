const express = require('express');
const { createPost, getPosts, getPostById, updatePost, deletePost, uploadMiddleware } = require('../controllers/postController');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a post
router.post('/', auth, uploadMiddleware, createPost);

// Get all posts
router.get('/', getPosts);

// Get a single post by ID
router.get('/:id', getPostById);

// Update a post
router.put('/:id', auth, updatePost);

// Delete a post
router.delete('/:id', auth, deletePost);

module.exports = router;
