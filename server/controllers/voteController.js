const Idea = require('../models/idea');
const Vote = require('../models/vote');
const User = require('../models/user');

// create Vote
exports.createVote = async (req, res) => {
    const { userId, ideaId, isLike } = req.body;
    try {
        // Check if user owns this idea
        const idea = await Idea.findOne({ where: { id: ideaId } });
        if (!idea) {
            return res.status(400).json({ message: 'Idea not found' });
        }

        if (idea.userId === userId) {
            return res.status(400).json({ message: 'User cannot vote on their own idea' });
        }

        // Check if user already voted on this idea
        const existingVote = await Vote.findOne({ where: { userId: userId, ideaId: ideaId } });
        if (existingVote) {
            return res.status(400).json({ message: 'User has already voted on this idea' });
        }

        // Create the vote
        const newVote = await Vote.create({ userId: userId, ideaId: ideaId, isLike: isLike });

        // Decrement idea crits (each crit = ~10 views, so subtract 0.1 per vote)
        const currentIdeaCrits = idea.ideaCrits;
        const newIdeaCrits = Math.max(0, currentIdeaCrits - 0.1);
        await Idea.update({ ideaCrits: newIdeaCrits }, { where: { id: ideaId } });

        // Give voter a chance to earn a crit (10% chance)
        let userGainedCrit = false;
        let newUserCrits = 0;
        if (Math.random() < 0.10) {
            const user = await User.findOne({ where: { id: userId } });
            newUserCrits = user.crits + 1;
            await User.update({ crits: newUserCrits }, { where: { id: userId } });
            userGainedCrit = true;
        }

        res.status(200).json({
            message: "Successfully created vote",
            userGainedCrit: userGainedCrit,
            userCrits: userGainedCrit ? newUserCrits : undefined
        });

    } catch (error) {
        console.error('Create vote error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteVote = async (req, res) => {
    const { userId, ideaId } = req.body;
    try {
        const check = await Vote.findOne({ where: { userId: userId, ideaId: ideaId } });
        if (check){ //ensure vote exists in the first place
            await Vote.destroy({ where: { userId: userId, ideaId: ideaId } });
            res.status(201).json({ message: 'Vote delete successful'});
        } 
        else {
            return res.status(400).json({message: 'Vote does not exist'});
        }
    } catch (error) {
        console.error('Error deleting idea:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getVote = async (req, res) => {
    const { userId, ideaId } = req.body;
    try {
        const vote = await Vote.findOne({ where: { userId: userId, ideaId: ideaId } });
        if (vote){ //ensure vote exists in the first place
            return res.status(201).json({message: 'Vote found', voter: vote.userId, idea: vote.ideaId, isLike: vote.isLike});
        } 
        else {
            return res.status(400).json({message: 'Vote does not exist'});
        }
    } catch (error) {
        console.error('Error deleting idea:', error);
        res.status(500).json({ message: 'Server error' });
    }
};