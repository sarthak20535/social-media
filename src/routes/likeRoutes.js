const express = require('express');
const { likePost, unlikePost } = require('../controllers/likeController');
const auth = require('../middleware/auth');

const router = express.Router();

// Like a post
router.post('/:id/like', auth, likePost);

// Unlike a post
router.post('/:id/unlike', auth, unlikePost);

module.exports = router;
