const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Post = require('../Models/Post');
const authMiddleware = require('../Middleware/authMiddleware');

// Add Post
router.post(
    '/add',
    authMiddleware,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('image', 'Image is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, image } = req.body;
        try {
            const post = new Post({
                user_id: req.user._id,
                title,
                description,
                image
            });
            await post.save();
            res.status(201).json({
                message: "Post created successfully",
                status: "1",
                data: post
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server error' });
        }
    }
);

// Update Post
router.put(
    '/update/:id',
    authMiddleware,
    [
        check('title', 'Title must not be empty').optional().not().isEmpty(),
        check('description', 'Description must not be empty').optional().not().isEmpty(),
        check('image', 'Image must not be empty').optional().not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, image } = req.body;

        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ msg: 'Post not found' });

            if (post.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ msg: 'Not authorized' });
            }

            post.title = title || post.title;
            post.description = description || post.description;
            post.image = image || post.image;

            await post.save();
            res.json({
                message: "Post updated successfully",
                status: "1",
                data: post
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server error' });
        }
    }
);

// Get Post
router.get('/get/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        res.json({
            message: "Post fetched successfully",
            status: "1",
            data: post
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete Post
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        if (!req.params.id){
            return res.status(400).json({ msg: 'Missing post id' });
        }
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await post.remove();
        res.json({ message: 'Post removed', status: "1" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get All Posts
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json({
            message: "Posts fetched successfully",
            status: "1",
            data: posts
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
