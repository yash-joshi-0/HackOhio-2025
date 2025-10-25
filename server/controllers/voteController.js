const Idea = require('../models/idea');
const Vote = require('../models/vote');
const User = require('../models/user');

// create Idea
exports.createVote = async (req, res) => {
    const { userId, ideaId, isLike } = req.body;
    try {
        const ideaOwner = await Idea.findOne({attributes: [userId]}, {where: {ideaId: ideaId}}); //get owner of idea
        if(userId != ideaOwner){ //ensure the person leaving the vote does not own the idea
            const newVote = await Vote.create({userId: userId}, {ideaId: ideaId}, {isLike: isLike});
        } else{ //userid equals owner of idea. not allowed
            res.status(400).json({ message: 'User cannot leave a vote on their own idea' });
        }
        
        const newIdea = await Idea.create({ ideaDescription: newIdeaDesc, ideaCrits: newIdeaCrits, userId: userId });
        
        res.status(200).json({ message: 'Create idea successful!'});
    } catch (error) {
        console.error('Create idea error:', error);
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