const Idea = require('../models/idea');
const Vote = require('../models/vote');
const User = require('../models/user');

// create Idea
exports.createVote = async (req, res) => {
    const { userId, ideaId, isLike } = req.body;
    try {
        /*const ideaOwner = await Idea.findOne({attributes: [userId], where: {ideaId: ideaId}}); //get owner of idea
        if(userId != ideaOwner){ //ensure the person leaving the vote does not own the idea
            */
           const newVote = await Vote.create({userId: userId, ideaId: ideaId, isLike: isLike}); //creates their vote
           /* let ideaLosesCrit = false;
            let userGainsCrit = true;
            let userCrits = await User.findOne({attributes: ['crits']}, {where: {userId: userId}});

            if (Math.random() < 0.05) { //5% chance of idea losing a crit
                const curIdeaCrits = await Idea.findOne({attributes: ['ideaCrits']},{where: {ideaId: ideaId}});
                const newIdeaCrits = curIdeaCrits - 1;
                await Idea.update({ideaCrits: newIdeaCrits},{where: {ideaId: ideaId}});
                ideaLosesCrit = true;
            }
            if (Math.random() < 0.10) { //10% chance user gains a crit
                userCrits = userCrits - 1;
                await User.update({crits: userCrits},{where: {userId: userId}});
                userGainsCrit = true;
            }*/
            res.status(200).json({message: "Successfully created vote"/*, userCrits: userCrits, userGainsCrit: userGainsCrit, ideaLosesCrit: ideaLosesCrit*/});
            
        //} else{ //userid equals owner of idea. not allowed
        //    res.status(400).json({ message: 'User cannot leave a vote on their own idea' });
        //}
        
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