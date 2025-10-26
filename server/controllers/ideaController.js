const Idea = require('../models/idea');
const Vote = require('../models/vote');
const User = require('../models/user');
const { Sequelize } = require('sequelize');

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
            // Get all ideas the user has voted on
            const votedIdeaIds = await Vote.findAll({
                where: { userId: userId },
                attributes: ['ideaId'],
                raw: true
            });

            const votedIds = votedIdeaIds.map(vote => vote.ideaId);

            // Find the highest crit idea that:
            // 1. User hasn't voted on
            // 2. User doesn't own
            const idea = await Idea.findOne({
                where: {
                    userId: { [Sequelize.Op.ne]: userId }, // Not owned by user
                    id: { [Sequelize.Op.notIn]: votedIds.length > 0 ? votedIds : [-1] }, // Not voted on by user
                    ideaCrits: { [Sequelize.Op.gt]: 0 } // Has crits remaining
                },
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

exports.getTopIdeaForAnonymous = async (req, res) => {
    const { votedIdeaIds } = req.body;
        try {
            // Find the highest crit idea that anonymous user hasn't voted on
            const idea = await Idea.findOne({
                where: {
                    id: { [Sequelize.Op.notIn]: votedIdeaIds.length > 0 ? votedIdeaIds : [-1] }, // Not voted on
                    ideaCrits: { [Sequelize.Op.gt]: 0 } // Has crits remaining
                },
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
        const check = await Idea.findOne({where: {id: ideaId}});
        if(check){ //make sure idea exists
            await Idea.destroy({ where: { id: ideaId } });
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
        // Check if user has enough crits
        const user = await User.findOne({attributes: ['crits'], where: {id: userId}});
        if(!user){
            return res.status(400).json({message: 'User not found'});
        }
        const userCritAmount = user.crits;
        if(userCritAmount >= critAmount){
            //user has enough crits
            const newCritAmount = userCritAmount - critAmount;
            const idea = await Idea.findOne({attributes: ['ideaCrits'], where: {id: ideaId}}); //get old idea crit amount
            if(!idea){
                return res.status(400).json({message: 'Idea not found'});
            }
            const ideaCritAmount = idea.ideaCrits;
            const newIdeaCritAmount = ideaCritAmount + critAmount;
            await User.update({crits: newCritAmount}, {where: {id: userId}}); //edit user to have less crits
            await Idea.update({ideaCrits: newIdeaCritAmount}, {where: {id: ideaId}}); //edit idea to have more crits
            return res.status(201).json({message:'Boosted idea crits and subtracted user crit', userCritAmount: newCritAmount});
        } else {
            //user does not have enough crits
            return res.status(400).json({message: 'User does not have enough crits', userCritAmount: userCritAmount});
        }

    } catch (error) {
        console.error('Error boosting crits:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getIdeasWithVotesFromUser = async (req, res) => {
    const { userId } = req.body;
        try {
            const ideas = await Idea.findAll({
                where: { userId: userId },
                attributes: {
                    // This will include all default Idea attributes
                    // and add the following two counts:
                    include: [
                        // Count of likes
                        [
                            // Use COALESCE to turn NULL (no votes) into 0
                            Sequelize.fn("COALESCE",
                                Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Votes"."isLike" = true THEN 1 ELSE 0 END`)),
                                0 // Value to use if the SUM is NULL
                            ),
                            "likeCount"
                        ],
                        // Count of dislikes
                        [
                            Sequelize.fn("COALESCE",
                                Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Votes"."isLike" = false THEN 1 ELSE 0 END`)),
                                0
                            ),
                            "dislikeCount"
                        ]
                    ],
                },
                include: [
                    {
                        model: Vote,
                        attributes: [], // We don't want individual vote rows
                    },
                ],
                group: ["Idea.id"], // Group by the Idea's primary key
                raw: true, // Helpful for GROUP queries
            });

            if (!ideas || ideas.length === 0) {
                return res.status(200).json({ message: 'No ideas for user found', ideas: [] });
            }

            return res.status(200).json({ message: 'Found ideas', ideas: ideas });
        } catch (error) {
            console.error('Error finding idea', error);
            res.status(500).json({ message: 'Server error' });
        }
}