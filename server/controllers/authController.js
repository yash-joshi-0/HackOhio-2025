const User = require('../models/user');
const Vote = require('../models/vote');
const bcrypt = require('bcryptjs');

// User login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        res.status(200).json({ message: 'Login successful!', user: { id: user.id, username: user.username, crits: user.crits } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// User signup
exports.signup = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already in use.' });
        }

        // Create new user
        var crits = 5
        const newUser = await User.create({ username, crits, password });
        res.status(201).json({ message: 'Signup successful!', user: { id: newUser.id, username: newUser.username, crits: newUser.crits } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Merge anonymous data into user account
exports.mergeAnonymousData = async (req, res) => {
    const { userId, anonymousVotes, anonymousCrits } = req.body;
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Add anonymous crits to user account
        const newCrits = user.crits + anonymousCrits;
        await User.update({ crits: newCrits }, { where: { id: userId } });

        // Add anonymous votes, avoiding duplicates
        let votesAdded = 0;
        for (const vote of anonymousVotes) {
            const existingVote = await Vote.findOne({
                where: { userId: userId, ideaId: vote.ideaId }
            });
            if (!existingVote) {
                await Vote.create({
                    userId: userId,
                    ideaId: vote.ideaId,
                    isLike: vote.isLike
                });
                votesAdded++;
            }
        }

        res.status(200).json({
            message: 'Anonymous data merged successfully',
            newCrits: newCrits,
            votesAdded: votesAdded
        });
    } catch (error) {
        console.error('Merge anonymous data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};