const User = require('../models/user');

//get user
exports.getUser = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findOne({ where: { userId: userId } });
        if (!user) {
            return res.status(400).json({ message: 'No user found' });
        }

        res.status(200).json({ message: 'Found user', user: { id: user.userId, username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.boostUserCrits = async (req, res) => {
    const { userId, critAmount } = req.body;
    try {
        const user = await User.findOne({ where: { userId: userId } });
        if (!user) {
            return res.status(400).json({ message: 'No user found' });
        }
        const curUserCritAmount = await User.findOne({attributes: ['crits']}, {where: {userId: userId}});
        const newUserCritAmount = curUserCritAmount + critAmount;
        await User.update({crits: newUserCritAmount},{where: {userId: userId}});
        return res.status(200).json({ message: 'Boosted user crits'}, {userCritAmount: newUserCritAmount});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};