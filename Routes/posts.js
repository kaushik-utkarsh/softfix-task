const express = require('express');
const router = express.Router();
const Post = require('../Models/Post');
const authMiddleware = require('../Middleware/authMiddleware');

// Add Post
router.post('/add', authMiddleware, async (req, res) => {
    const { title, description, image } = req.body;
    // here i am expecting that img will be a blob and i am saving it directly on the db, 
    // we ccan use Multar or FS module for saving/ uploading the file to the server

    // also the response  can be in the form of 
    /* 
        {
    "message": "Data fetched successfully",
    "status": "1",
    "data": []
    }
    */

    try {
        const post = new Post({
            user_id: req.user._id,
            title,
            description,
            image
        });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update Post
router.put('/update/:id', authMiddleware, async (req, res) => {
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
        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get Post
router.get('/get/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete Post
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await post.remove();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get All Posts
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
