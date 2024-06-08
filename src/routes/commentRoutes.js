const express = require('express');
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Add a comment to a post
router.post('/:postId', auth, addComment);

// Get comments for a post
router.get('/:postId', getComments);

// Delete a comment
router.delete('/:id', auth, deleteComment);

module.exports = router;
