const Idea = require('../models/idea');
const Vote = require('../models/vote');
const User = require('../models/user');

// create Idea
exports.createIdea = async (req, res) => {
    const { newIdeaDesc, userId } = req.body;
    try {
        const ideaCrits = 0

        const newIdea = await Idea.create({ ideaDescription: newIdeaDesc, ideaCrits: ideaCrits, userId: userId });

        res.status(200).json({ message: 'Create idea successful!'});
    } catch (error) {
        console.error('Create idea error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTopIdeaForUser = async (req, res) => {
    const { userId } = req.body;
        try {
            const idea = await Idea.findOne({
                order: [["ideaCrits", "DESC"]],
            });
            if (!idea) {
                return res.status(400).json({ message: 'Next unvoted idea not found' });
            }
            return res.status(200).json({ message: 'Found idea', idea: idea});
        } catch (error) {
            console.error('Error finding idea', error);
            res.status(500).json({ message: 'Server error' });
        }
}

exports.deleteIdea = async (req, res) => {
    const { ideaId } = req.body;
    try {
        const check = await Idea.findOne({where: {ideaId: ideaId}});
        if(check){ //make sure idea exists
            await Idea.destroy({ where: { ideaId: ideaId } });
            res.status(201).json({ message: 'Idea delete successful'});
        }
        else {
            res.status(400).json({message:'Idea does not exist'});
        }
        

    } catch (error) {
        console.error('Error deleting idea:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.userBoostsCrits = async (req, res) => {
    const { userId, ideaId, critAmount } = req.body;
    try {
        // Check if user as enough crits
        const userCritAmount = await User.findOne({attributes: [crits], where: {userId: userId}});
        if(userCritAmount >= critAmount){
            //user has enough crits
            const newCritAmount = userCritAmount - critAmount;
            const ideaCritAmount = await Idea.findOne({attributes: [ideaCrits], where: {ideaId: ideaId}}); //get old idea crit amount
            const newIdeaCritAmount = ideaCritAmount + critAmount;
            await User.update({crits: newCritAmount}, {where: {userId: userId}}); //edit user to have less crits
            await Idea.update({ideaCrits: newIdeaCritAmount}, {where: {ideaId: ideaId}}); //edit idea to have more crits
            return res.status(201).json({message:'Boosted idea crits and subtracted user crit'},{userCritAmount: newCritAmount});
        } else {
            //user does not have enough crits
            return res.status(400).json({message: 'User does not have enough crits'},{userCritAmount: userCritAmount});
        }

    } catch (error) {
        console.error('Error deleting idea:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getIdeasWithVotesFromUser = async (req, res) => {
    const { userId } = req.body;
        try {
            const ideas = await Idea.findAll({
                where: { user_id: userId },
                    attributes: {
                        include: [
                            // Count of likes
                            [
                                Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN Votes.isLike = true THEN 1 ELSE 0 END`)),
                                "likeCount"
                            ],
                            // Count of dislikes
                            [
                                Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN Votes.isLike = false THEN 1 ELSE 0 END`)),
                                "dislikeCount"
                            ]
                        ],
                    },
                include: [
                    {
                        model: Vote,
                        attributes: [], // we only want aggregated counts, not individual votes
                    },
                ],
                group: ["Idea.ideaId"],
                //order: [["ideaCrits", "DESC"]], //can be re added if we need the list sorted by highest first
                raw: true,
            });
            if (!ideas) {
                return res.status(400).json({ message: 'No ideas for user found' });
            }
    
            return res.status(200).json({ message: 'Found ideas'}, {ideas: ideas});
        } catch (error) {
            console.error('Error finding idea', error);
            res.status(500).json({ message: 'Server error' });
        }
}