const axios = require('axios');

const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://llm:8000';

exports.simplifyIdea = async (req, res) => {
    try {
        const { summary } = req.body;

        if (!summary || summary.trim() === '') {
            return res.status(400).json({ message: 'Summary is required' });
        }

        // Call the LLM service
        const response = await axios.post(`${LLM_SERVICE_URL}/simplify`, {
            summary: summary
        }, {
            timeout: 30000 // 30 second timeout
        });

        res.status(200).json({
            elevator_pitch: response.data.elevator_pitch
        });

    } catch (error) {
        console.error('Error calling LLM service:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'LLM service is unavailable. Please try again later.'
            });
        }

        if (error.response) {
            return res.status(error.response.status).json({
                message: error.response.data.detail || 'Error generating elevator pitch'
            });
        }

        res.status(500).json({
            message: 'Failed to simplify idea. Please try again.'
        });
    }
};
